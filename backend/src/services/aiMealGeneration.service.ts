import { z } from 'zod';
import { Types } from 'mongoose';
import HealthProfile from '../models/healthProfile.model';
import MealPlan from '../models/mealPlan.model';
import Meal from '../models/meal.model';
import AppError from '../utils/AppError';
import { syncTotalCalories } from './mealPlan.service';

const MealSchema = z.object({
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  name: z.string(),
  description: z.string(),
  calories: z.number().int().positive(),
  time: z.string(),
  timing: z.enum(['pre_workout', 'post_workout', 'none']),
  ingredients: z.array(z.string()),
  recipe: z.array(z.string()).min(1),
  imageKeywords: z.array(z.string()).min(1).max(3),
});

const MealPlanSchema = z.object({
  meals: z.array(MealSchema).min(1).max(12),
});

/**
 * Generate AI meal suggestions for a meal plan and persist them.
 * Requires the plan to have no existing meals.
 */
export const generateMealsForPlan = async (
  planId: string,
  userId: Types.ObjectId,
  isAdmin: boolean
): Promise<void> => {
  const { generateObject } = await import('ai');
  const { groq } = await import('@ai-sdk/groq');

  if (!Types.ObjectId.isValid(planId)) throw new AppError('Invalid meal plan ID', 400);

  const filter: Record<string, unknown> = { _id: planId, deletedAt: null };
  if (!isAdmin) filter.userId = userId;

  const plan = await MealPlan.findOne(filter);
  if (!plan) throw new AppError('Meal plan not found or access denied', 404);

  const profile = await HealthProfile.findOne({ userId, deletedAt: null });
  if (!profile) throw new AppError('Complete your health profile before generating meals', 400);

  // Delete any existing meals for the plan (regenerate)
  await Meal.updateMany({ mealPlanId: plan._id }, { deletedAt: new Date() });

  const {
    gender,
    age,
    weight,
    height,
    activityLevel,
    goal,
    conditions,
    allergies,
    dietaryPreference,
    preferredFoods,
    forbiddenFoods,
    mealsPerDay,
    wakeTime,
    sleepTime,
    calorieTarget,
  } = profile;

  const conditionText = conditions.length ? `Medical conditions: ${conditions.join(', ')}.` : '';
  const allergyText = allergies.length ? `Allergies (strictly avoid): ${allergies.join(', ')}.` : '';
  const dietText = dietaryPreference.length ? `Dietary preferences: ${dietaryPreference.join(', ')}.` : '';
  const preferText = preferredFoods.length ? `Preferred foods: ${preferredFoods.join(', ')}.` : '';
  const forbidText = forbiddenFoods.length ? `Forbidden foods (strictly avoid): ${forbiddenFoods.join(', ')}.` : '';

  const prompt = `You are a nutrition planning assistant. Generate a one-day meal plan for a user. The meal plan should be realistic, balanced, and suitable for the user's needs.

PROFILE:
- Gender: ${gender}, Age: ${age}, Weight: ${weight}kg, Height: ${height}cm
- Activity level: ${activityLevel}
- Goal: ${goal}
- Daily calorie target: ${calorieTarget} kcal
${conditionText}
${allergyText}
${dietText}
${preferText}
${forbidText}

REQUIREMENTS:
- Generate exactly ${mealsPerDay} meals spread across the day.
- Wake time: ${wakeTime}, Sleep time: ${sleepTime}.
- First meal shortly after wake time, last meal 2 hours before sleep.
- Meals distributed roughly evenly through waking hours.
- Total calories should be close to ${calorieTarget} kcal.
- Each meal must have: type (breakfast/lunch/dinner/snack), name, short description, calories (kcal integer), time (HH:MM 24h), timing, ingredients list (5-10 items), recipe (3-8 distinct numbered cooking steps), imageKeywords (exactly 2-3 short, common food search terms that describe the FINISHED DISH).
- "imageKeywords" are used to find a photo of the whole finished dish. Put the dish type word FIRST (e.g. "omelette", "salad", "soup", "stir fry", "curry", "wrap", "bowl", "parfait", "smoothie", "pasta", "bake"), then 1-2 main ingredient words (e.g. "spinach", "feta", "salmon"). Multi-word terms are allowed (e.g. "stir fry", "sweet potato"). Use only widely-known, generic food words; avoid the full recipe name, brand names, and exotic wording that would not appear in a photo search.
- "description" is a short 1-2 sentence summary of the dish. "recipe" is a SEPARATE array of clear, individual, sequential cooking instructions (e.g. "Dice the onion and garlic", "Heat oil in a pan over medium heat", "Add the chicken and cook for 6-8 minutes"). Do not repeat the description text inside recipe steps, and do not combine multiple actions into one step.
- For "timing": if the user's activity level suggests they likely work out (moderately_active or very_active), label ONE snack shortly before a likely workout window as "pre_workout" (light, carb-focused, easy to digest) and ONE snack or meal shortly after as "post_workout" (protein-focused, supports recovery). All other meals must be "none". If the user is sedentary or lightly_active, label every meal "none".
- Do not include forbidden foods or allergens.
- Provide realistic, delicious recipes appropriate for the dietary preference.
- Use "snack" type for smaller in-between meals if mealsPerDay > 3.`;

  const { object } = await generateObject({
    model: groq('openai/gpt-oss-120b'),
    schema: MealPlanSchema,
    prompt: `${prompt}\n\nCRITICAL: You must return your response as a valid, raw JSON object matching the requested schema. The word JSON is a strict requirement for this system. Do not include conversational text or wrapping markdown code blocks like \`\`\`json.`,
    providerOptions: {
      groq: {
        structuredOutputs: false, // Disables strict json_schema, tells Groq to use native JSON mode safely
        temperature: 0.7,
        topP: 0.85,
      },
    },
  });

/**
 * --- Meal image resolution ---
 *
 * We always want a photo of the WHOLE finished dish, never a single raw
 * ingredient. Strategy (in order of preference):
 * 1. TheMealDB meal search by the dish keywords (e.g. "chicken quinoa" ->
 *    "Chicken Quinoa Greek Salad"). Fast, reliable, real dish photography.
 * 2. Wikimedia Commons search for the same keywords (accurate for unusual
 *    dishes, but its anonymous API rate-limits aggressively). Requests are
 *    serialized, use a descriptive User-Agent, honor 429 retry-after, and
 *    results are cached so repeated meals do not re-search.
 * 3. TheMealDB search by the dish-type keyword alone (broader match).
 * 4. TheMealDB filter by each keyword as an ingredient (dishes containing it).
 * 5. TheMealDB category filter mapped from the meal type (guaranteed photo).
 *
 * Every result URL comes from an image API/CDN and loads reliably; the
 * frontend keeps a bundled local photo as a final safety net.
 */

const USER_AGENT = 'EatWise/1.0 (meal-plan image lookup; contact: eatwise@example.com)';

const imageCache = new Map<string, string | null>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isImageReachable = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
    });
    clearTimeout(timer);
    return res.ok && (res.headers.get('content-type') ?? '').startsWith('image/');
  } catch {
    return false;
  }
};

interface CommonsPage {
  title?: string;
  imageinfo?: { url?: string; thumburl?: string; mime?: string; width?: number }[];
}

const searchWikimediaImage = async (keywords: string[]): Promise<string | null> => {
  const trySearch = async (query: string): Promise<string | null> => {
    const url = new URL('https://commons.wikimedia.org/w/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('generator', 'search');
    url.searchParams.set('gsrsearch', `filetype:bitmap ${query} food`);
    url.searchParams.set('gsrnamespace', '6');
    url.searchParams.set('gsrlimit', '20');
    url.searchParams.set('prop', 'imageinfo');
    url.searchParams.set('iiprop', 'url|mime|size');
    url.searchParams.set('iiurlwidth', '800');
    url.searchParams.set('format', 'json');

    let res: Response;
    try {
      res = await fetch(url.toString(), { headers: { 'User-Agent': USER_AGENT } });
    } catch {
      return null;
    }

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('retry-after') ?? '1');
      await sleep(Math.min(retryAfter || 1, 5) * 1000);
      try {
        res = await fetch(url.toString(), { headers: { 'User-Agent': USER_AGENT } });
      } catch {
        return null;
      }
    }
    if (!res.ok) return null;

    let pages: CommonsPage[];
    try {
      const data = (await res.json()) as { query?: { pages?: Record<string, CommonsPage> } };
      pages = Object.values(data.query?.pages ?? {});
    } catch {
      return null;
    }

    const longKeywords = keywords.filter((k) => k.length >= 4);
    const candidates: string[] = [];

    for (const page of pages) {
      if (candidates.length >= 5) break;
      const info = page.imageinfo?.[0];
      if (!info) continue;
      if (info.mime !== 'image/jpeg' && info.mime !== 'image/png') continue;
      if ((info.width ?? 0) < 300) continue;
      const title = page.title?.toLowerCase() ?? '';
      if (longKeywords.length > 0 && !longKeywords.some((k) => title.includes(k))) continue;
      const candidate = info.thumburl ?? info.url;
      if (candidate) candidates.push(candidate);
    }

    for (const candidate of candidates) {
      if (await isImageReachable(candidate)) return candidate;
    }
    return null;
  };

  // Primary search with all keywords; fall back to a looser search on the
  // first keyword so a bad keyword never kills the image entirely.
  return (
    (await trySearch(keywords.join(' '))) ??
    (keywords[0] ? await trySearch(keywords[0]) : null)
  );
};

interface TheMealDBMeal {
  strMeal?: string;
  strMealThumb?: string;
}

/**
 * Search TheMealDB for a whole-dish photo. Tries each keyword as the search
 * term (dish-type word first) and, within the results, picks the meal whose
 * name contains the most keywords (e.g. keywords ["salad","chicken","quinoa"]
 * -> "Chicken Quinoa Greek Salad").
 */
const searchTheMealDB = async (keywords: string[]): Promise<string | null> => {
  const cleaned = keywords.map((k) => k.replace(/[^a-z0-9 ]/g, '').trim()).filter(Boolean);

  for (const kw of cleaned) {
    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(kw)}`,
        { headers: { 'User-Agent': USER_AGENT } }
      );
      if (!res.ok) continue;
      const data = (await res.json()) as { meals?: TheMealDBMeal[] | null };
      const meals = data.meals ?? [];
      if (meals.length === 0) continue;

      let best = meals[0];
      let bestScore = -1;
      for (const meal of meals) {
        const name = meal.strMeal?.toLowerCase() ?? '';
        let score = 0;
        for (const keyword of cleaned) {
          if (keyword.length >= 3 && name.includes(keyword)) score++;
        }
        if (score > bestScore) {
          bestScore = score;
          best = meal;
        }
      }
      return best.strMealThumb ?? null;
    } catch {
      continue;
    }
  }
  return null;
};

/** Filter TheMealDB by ingredient (`i`) or category (`c`). Returns the first dish photo. */
const filterTheMealDB = async (param: 'i' | 'c', value: string): Promise<string | null> => {
  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?${param}=${encodeURIComponent(value)}`,
      { headers: { 'User-Agent': USER_AGENT } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { meals?: TheMealDBMeal[] | null };
    return data.meals?.[0]?.strMealThumb ?? null;
  } catch {
    return null;
  }
};

const THEMEALDB_TYPE_CATEGORY: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Vegetarian',
  dinner: 'Seafood',
  snack: 'Vegetarian',
};

const resolveMealImage = async (keywords: string[], type: string): Promise<string | null> => {
  const cacheKey = `${type}:${keywords.join(' ')}`;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey) ?? null;

  let result: string | null = null;

  // 1. TheMealDB whole-dish search, scored against all keywords (best match).
  result = await searchTheMealDB(keywords);

  // 2. Wikimedia Commons search (accurate for unusual dishes).
  if (!result) result = await searchWikimediaImage(keywords);

  // 3. TheMealDB filter by each keyword as an ingredient (dishes containing it).
  if (!result) {
    for (const kw of keywords) {
      result = await filterTheMealDB('i', kw);
      if (result) break;
    }
  }

  // 4. TheMealDB category mapped from meal type (guaranteed photo).
  if (!result) result = await filterTheMealDB('c', THEMEALDB_TYPE_CATEGORY[type] ?? 'Vegetarian');

  imageCache.set(cacheKey, result);
  return result;
};

  // Persist meals
  const mealDocs: Array<Record<string, unknown>> = [];
  // Resolve images serially: parallel requests can trip external rate
  // limiters and turn into missing images.
  for (const m of object.meals) {
    // Build clean search keywords. Prefer the model's imageKeywords, falling
    // back to the first words of the meal name.
    const rawKeywords = (
      m.imageKeywords.length ? m.imageKeywords : m.name.toLowerCase().split(/\s+/)
    )
      .map((k) => k.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim())
      .filter(Boolean);
    const keywords = rawKeywords.slice(0, 3);

    mealDocs.push({
      mealPlanId: plan._id,
      type: m.type,
      name: m.name,
      description: m.description,
      calories: m.calories,
      time: m.time,
      timing: m.timing,
      ingredients: m.ingredients,
      recipe: m.recipe,
      imgUrl: await resolveMealImage(keywords, m.type),
      completed: false,
    });
  }

  await Meal.insertMany(mealDocs);
  await syncTotalCalories(plan._id as Types.ObjectId);
};