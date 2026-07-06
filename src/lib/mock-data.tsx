export type MealType = "Breakfast" | "Snack" | "Lunch" | "Dinner"

export interface Meal {
  id: string
  type: MealType
  name: string
  time: string
  timing?: string // for snacks: when to take it (e.g. "Post-Breakfast", "Pre-Workout")
  calories: number
  image: string
  ingredients: string[]
  description: string
  recipe: string[]
  eaten: boolean
}

export interface DayPlan {
  date: string // ISO yyyy-mm-dd
  target: number
  meals: Meal[]
  status: "completed" | "partial" | "skipped"
}

export const currentUser = {
  name: "Sarah Chen",
  email: "sarah@example.com",
  initials: "SC",
  memberSince: "March 2025",
  goal: "Weight Loss",
  dietType: "Vegetarian",
  activityLevel: "Moderately Active",
  weight: 64,
  height: 168,
  age: 29,
  conditions: ["Lactose Intolerance"],
  targetCalories: 2200,
  activeRules: ["dr1", "dr5"],
  // The user only chooses how many snacks they want; the plan decides the timing.
  snackCount: 2,
}

export const todaysMeals: Meal[] = [
  {
    id: "m1",
    type: "Breakfast",
    name: "Berry Oatmeal Bowl",
    time: "7:30 AM",
    calories: 380,
    image: "/meals/oatmeal.png",
    ingredients: ["Rolled oats", "Mixed berries", "Banana", "Honey", "Chia seeds"],
    description:
      "A fiber-rich, slow-releasing breakfast that keeps energy steady through the morning without a sugar crash.",
    recipe: [
      "Simmer ½ cup rolled oats with 1 cup water or milk for 5 minutes, stirring occasionally.",
      "Stir in 1 tbsp chia seeds and let thicken for 2 minutes.",
      "Top with mixed berries and sliced banana.",
      "Finish with a light drizzle of honey and serve warm.",
    ],
    eaten: true,
  },
  {
    id: "m3",
    type: "Lunch",
    name: "Grilled Chicken Quinoa Bowl",
    time: "1:00 PM",
    calories: 620,
    image: "/meals/chicken-bowl.png",
    ingredients: ["Grilled chicken", "Quinoa", "Roasted veg", "Avocado", "Greens"],
    description:
      "A balanced lunch bowl combining lean protein, whole grains and healthy fats to power the afternoon.",
    recipe: [
      "Season chicken breast with salt, pepper and paprika, then grill 6 minutes per side.",
      "Cook quinoa in broth until fluffy, about 15 minutes.",
      "Roast mixed vegetables at 200°C for 20 minutes.",
      "Assemble greens, quinoa and veg in a bowl, slice chicken on top and add avocado.",
    ],
    eaten: false,
  },
  {
    id: "m4",
    type: "Dinner",
    name: "Baked Salmon & Greens",
    time: "7:30 PM",
    calories: 605,
    image: "/meals/salmon.png",
    ingredients: ["Salmon fillet", "Broccoli", "Sweet potato", "Lemon", "Olive oil"],
    description:
      "An omega-3 rich dinner that's light on the stomach before bed while still keeping you satisfied.",
    recipe: [
      "Preheat oven to 200°C and line a tray with parchment.",
      "Place salmon and broccoli on the tray, drizzle with olive oil and lemon.",
      "Add cubed sweet potato and season everything with salt and pepper.",
      "Bake for 18–20 minutes until the salmon flakes easily.",
    ],
    eaten: false,
  },
]

/* ---------------- User-selectable dietary rules ---------------- */
export interface DietaryRule {
  id: string
  label: string
  description: string
}

export const dietaryRules: DietaryRule[] = [
  { id: "dr1", label: "Low added sugar", description: "Keep added sugar under 25g per day." },
  { id: "dr2", label: "High protein", description: "Prioritize at least 1.6g of protein per kg of body weight." },
  { id: "dr3", label: "Low sodium", description: "Limit sodium to 1,500mg per day." },
  { id: "dr4", label: "Whole grains only", description: "Replace refined grains with whole-grain alternatives." },
  { id: "dr5", label: "Veggies every meal", description: "Include at least two vegetable servings in each main meal." },
  { id: "dr6", label: "Limit saturated fat", description: "No more than 30% of daily calories from saturated fat." },
  { id: "dr7", label: "8-hour eating window", description: "Keep all meals within an 8-hour intermittent-fasting window." },
]

/* ---------------- Snacks ---------------- */

// A snack sits next to a main meal or a workout, either before or after it.
export type SnackAnchor = "Breakfast" | "Lunch" | "Dinner" | "Workout"

export interface SnackPlacement {
  id: string
  timing: string // human label for when to take it (e.g. "Post-Breakfast", "Pre-Workout")
  anchor: SnackAnchor
  position: "before" | "after"
  time: string
}

// The user only picks HOW MANY snacks they want. The plan auto-distributes them
// across the day in this priority order, spacing them around meals and workouts.
export const snackDistribution: SnackPlacement[] = [
  { id: "mid-morning", timing: "Post-Breakfast", anchor: "Breakfast", position: "after", time: "10:30 AM" },
  { id: "pre-workout", timing: "Pre-Workout", anchor: "Workout", position: "before", time: "4:00 PM" },
  { id: "post-workout", timing: "Post-Workout", anchor: "Workout", position: "after", time: "5:30 PM" },
  { id: "evening", timing: "Post-Dinner", anchor: "Dinner", position: "after", time: "9:00 PM" },
]

export const MAX_SNACKS = snackDistribution.length

// A resolved snack: which distribution slot it occupies.
export interface SnackChoice {
  id: string
  placement: string // matches a SnackPlacement id
}

// Turn a snack count into concrete, timed snack slots.
export function buildSnacksFromCount(count: number): SnackChoice[] {
  const n = Math.max(0, Math.min(count, MAX_SNACKS))
  return snackDistribution.slice(0, n).map((p) => ({ id: p.id, placement: p.id }))
}

// Snack recipes (same shape as meals) assigned to the user's snacks in order.
export const snackTemplates: Omit<Meal, "id" | "time" | "eaten">[] = [
  {
    type: "Snack",
    name: "Greek Yogurt Parfait",
    calories: 210,
    image: "/meals/yogurt.png",
    ingredients: ["Greek yogurt", "Granola", "Almonds", "Blueberries"],
    description:
      "A high-protein snack that curbs hunger between meals and supports muscle recovery.",
    recipe: [
      "Spoon ¾ cup Greek yogurt into a glass or jar.",
      "Layer with 2 tbsp granola and a small handful of blueberries.",
      "Top with crushed almonds for crunch.",
      "Repeat layers and serve chilled.",
    ],
  },
  {
    type: "Snack",
    name: "Apple & Almond Butter",
    calories: 190,
    image: "/meals/apple-almond.png",
    ingredients: ["Apple", "Almond butter", "Cinnamon"],
    description:
      "A satisfying mix of fiber and healthy fats that keeps energy steady without a sugar spike.",
    recipe: [
      "Core and slice one apple into wedges.",
      "Serve with 1 tbsp almond butter for dipping.",
      "Dust lightly with cinnamon and enjoy.",
    ],
  },
  {
    type: "Snack",
    name: "Green Protein Smoothie",
    calories: 240,
    image: "/meals/protein-smoothie.png",
    ingredients: ["Spinach", "Banana", "Protein powder", "Almond milk", "Chia seeds"],
    description:
      "A quick, drinkable snack packed with protein and greens — great around a workout.",
    recipe: [
      "Add 1 cup almond milk, a handful of spinach and half a banana to a blender.",
      "Scoop in one serving of protein powder.",
      "Blend until smooth, then stir in 1 tsp chia seeds.",
      "Pour into a glass and drink right away.",
    ],
  },
  {
    type: "Snack",
    name: "Hummus & Veggie Sticks",
    calories: 170,
    image: "/meals/hummus-veggies.png",
    ingredients: ["Hummus", "Carrots", "Cucumber", "Bell pepper", "Celery"],
    description:
      "A crunchy, low-calorie snack that adds an extra serving of vegetables to your day.",
    recipe: [
      "Cut carrots, cucumber, bell pepper and celery into sticks.",
      "Spoon ¼ cup hummus into a small bowl.",
      "Arrange the veggie sticks around the hummus and serve.",
    ],
  },
]

// Build the full day's meal list, interleaving the auto-distributed snacks
// around their anchor meals / workout so they appear in the right order.
export function buildDayMeals(mains: Meal[], snacks: SnackChoice[]): Meal[] {
  const snackMeals = snacks.map((snack, i) => {
    const placement = snackDistribution.find((p) => p.id === snack.placement) ?? snackDistribution[0]
    const template = snackTemplates[i % snackTemplates.length]
    return {
      meal: { ...template, id: snack.id, time: placement.time, timing: placement.timing, eaten: false } as Meal,
      placement,
    }
  })

  const order: SnackAnchor[] = ["Breakfast", "Lunch", "Workout", "Dinner"]
  const result: Meal[] = []

  for (const anchor of order) {
    const main = mains.find((m) => m.type === (anchor as MealType))
    snackMeals.filter((s) => s.placement.anchor === anchor && s.placement.position === "before").forEach((s) => result.push(s.meal))
    if (main) result.push(main)
    snackMeals.filter((s) => s.placement.anchor === anchor && s.placement.position === "after").forEach((s) => result.push(s.meal))
  }

  return result
}

export const weeklyCalories = [
  { day: "Mon", calories: 2050, target: 2200 },
  { day: "Tue", calories: 2180, target: 2200 },
  { day: "Wed", calories: 1980, target: 2200 },
  { day: "Thu", calories: 2240, target: 2200 },
  { day: "Fri", calories: 1815, target: 2200 },
  { day: "Sat", calories: 2100, target: 2200 },
  { day: "Sun", calories: 1900, target: 2200 },
]

export interface RecentPlan {
  date: string
  label: string
  calories: number
  completed: number
  total: number
  status: "completed" | "partial" | "skipped"
}

export const recentPlans: RecentPlan[] = [
  { date: "2026-06-30", label: "Jun 30, 2026", calories: 2100, completed: 4, total: 4, status: "completed" },
  { date: "2026-06-29", label: "Jun 29, 2026", calories: 1815, completed: 3, total: 4, status: "partial" },
  { date: "2026-06-28", label: "Jun 28, 2026", calories: 0, completed: 0, total: 4, status: "skipped" },
  { date: "2026-06-27", label: "Jun 27, 2026", calories: 2240, completed: 4, total: 4, status: "completed" },
  { date: "2026-06-26", label: "Jun 26, 2026", calories: 1980, completed: 4, total: 4, status: "completed" },
]

/* ---------------- Admin data ---------------- */
export interface AdminUser {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  complete: boolean
  joined: string
}

export const adminUsers: AdminUser[] = [
  { id: "u1", name: "Sarah Chen", email: "sarah@example.com", role: "user", complete: true, joined: "2026-03-12" },
  { id: "u2", name: "Marcus Lee", email: "marcus@example.com", role: "user", complete: true, joined: "2026-04-02" },
  { id: "u3", name: "Priya Nair", email: "priya@example.com", role: "user", complete: false, joined: "2026-05-18" },
  { id: "u4", name: "David Okoro", email: "david@example.com", role: "admin", complete: true, joined: "2026-01-09" },
  { id: "u5", name: "Elena Rossi", email: "elena@example.com", role: "user", complete: true, joined: "2026-06-21" },
  { id: "u6", name: "Tom Baker", email: "tom@example.com", role: "user", complete: false, joined: "2026-06-28" },
]

export interface Rule {
  id: string
  description: string
  active: boolean
  addedBy: string
  date: string
}

export const adminRules: Rule[] = [
  { id: "r1", description: "No more than 30% of daily calories from saturated fat", active: true, addedBy: "David Okoro", date: "2026-02-10" },
  { id: "r2", description: "Diabetic plans must keep added sugar under 25g/day", active: true, addedBy: "David Okoro", date: "2026-03-01" },
  { id: "r3", description: "Include at least 2 servings of vegetables per main meal", active: true, addedBy: "Admin Team", date: "2026-03-15" },
  { id: "r4", description: "Sodium limit of 1500mg/day for hypertension profiles", active: false, addedBy: "David Okoro", date: "2026-04-22" },
]
