import { generateObject } from 'ai';
import { groq } from '@ai-sdk/groq';
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
- Each meal must have: type (breakfast/lunch/dinner/snack), name, short description, calories (kcal integer), time (HH:MM 24h), timing, ingredients list (5-10 items), recipe (3-8 distinct numbered cooking steps).
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

  // Persist meals
  const mealDocs = object.meals.map((m) => {
    // Build clean, comma-separated Flickr tags from the meal name.
    // (encodeURIComponent on the whole "name,food" string would encode the
    // separator comma itself, collapsing everything into one garbled tag
    // that never matches — so encode each word individually instead.)
    const keywords = m.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(encodeURIComponent)
      .join(',');

    return {
      mealPlanId: plan._id,
      type: m.type,
      name: m.name,
      description: m.description,
      calories: m.calories,
      time: m.time,
      timing: m.timing,
      ingredients: m.ingredients,
      recipe: m.recipe,
      imgUrl: `https://loremflickr.com/500/500/food${keywords ? `,${keywords}` : ''}`,
      completed: false,
    };
  });

  await Meal.insertMany(mealDocs);
  await syncTotalCalories(plan._id as Types.ObjectId);
};