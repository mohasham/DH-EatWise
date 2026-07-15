// ─── Base fetch helper ────────────────────────────────────────────────────────

const BASE = 'http://localhost:5000/api'
const TOKEN_KEY = 'eatwise_token'

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message =
      body?.message ||
      body?.errors?.[0]?.message ||
      `Request failed with status ${res.status}`
    throw new Error(message)
  }

  // 204 No Content – return null
  if (res.status === 204) return null as T

  return res.json()
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiUser {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  profileComplete: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiHealthProfile {
  _id: string
  userId: string
  gender: string
  age: number
  weight: number
  height: number
  goal: string
  conditions: string[]
  allergies: string[]
  dietaryPreference: string[]
  preferredFoods: string[]
  forbiddenFoods: string[]
  mealsPerDay: number
  workStart: string | null
  workEnd: string | null
  studyStart: string | null
  studyEnd: string | null
  wakeTime: string
  sleepTime: string
  activityLevel: string
  calorieTarget: number
  ruleIds: ApiRule[] | string[]
  createdAt: string
  updatedAt: string
}

export interface ApiMealPlan {
  _id: string
  userId: string
  healthProfileId: string
  date: string
  totalCalories: number
  status: 'active' | 'completed' | 'skipped'
  createdAt: string
  updatedAt: string
}

export interface ApiMeal {
  _id: string
  mealPlanId: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  name: string
  description: string
  calories: number
  time: string
  timing: 'pre_workout' | 'post_workout' | 'none'
  ingredients: string[]
  recipe: string[]
  imgUrl: string | null
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiRule {
  _id: string
  description: string
  isActive: boolean
  addedBy: { _id: string; name: string; email: string } | string
  lastModifiedBy: { _id: string; name: string; email: string } | string | null
  createdAt: string
  updatedAt: string
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string; confirmPassword: string }) =>
  request<{ status: string; token: string; data: { user: ApiUser } }>(
    '/auth/register',
    { method: 'POST', body: JSON.stringify(data) }
  ),

  login: (data: { email: string; password: string }) =>
    request<{ status: string; token: string; data: { user: ApiUser } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  logout: () =>
    request<{ status: string; message: string }>('/auth/logout', {
      method: 'POST',
    }),
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  getAll: () =>
    request<{ status: string; results: number; data: { users: ApiUser[] } }>(
      '/users'
    ),

  getById: (id: string) =>
    request<{ status: string; data: { user: ApiUser } }>(`/users/${id}`),

  update: (
    id: string,
    data: { name?: string; role?: 'user' | 'admin'; profileComplete?: boolean }
  ) =>
    request<{ status: string; data: { user: ApiUser } }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) => request<null>(`/users/${id}`, { method: 'DELETE' }),
}

// ─── Health Profile ───────────────────────────────────────────────────────────

export const healthProfileApi = {
  get: () =>
    request<{ status: string; data: { profile: ApiHealthProfile } }>(
      '/health-profile'
    ),

  upsert: (data: Partial<ApiHealthProfile>) =>
    request<{ status: string; data: { profile: ApiHealthProfile } }>(
      '/health-profile',
      { method: 'PUT', body: JSON.stringify(data) }
    ),
}

// ─── Meal Plans ───────────────────────────────────────────────────────────────

export const mealPlansApi = {
  getAll: (params?: { startDate?: string; endDate?: string }) => {
    const qs = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : ''
    return request<{
      status: string
      results: number
      data: { plans: ApiMealPlan[] }
    }>(`/meal-plans${qs}`)
  },

  getById: (id: string) =>
    request<{ status: string; data: { plan: ApiMealPlan } }>(
      `/meal-plans/${id}`
    ),

  create: (data: { date: string; status?: string }) =>
    request<{ status: string; data: { plan: ApiMealPlan } }>('/meal-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { status?: string; totalCalories?: number }) =>
    request<{ status: string; data: { plan: ApiMealPlan } }>(
      `/meal-plans/${id}`,
      { method: 'PUT', body: JSON.stringify(data) }
    ),

  delete: (id: string) =>
    request<null>(`/meal-plans/${id}`, { method: 'DELETE' }),

  getMeals: (planId: string) =>
    request<{ status: string; results: number; data: { meals: ApiMeal[] } }>(
      `/meal-plans/${planId}/meals`
    ),

  addMeal: (
    planId: string,
    data: {
      type: string
      name: string
      calories: number
      description?: string
      time?: string
      ingredients?: string[]
      imgUrl?: string | null
    }
  ) =>
    request<{ status: string; data: { meal: ApiMeal } }>(
      `/meal-plans/${planId}/meals`,
      { method: 'POST', body: JSON.stringify(data) }
    ),

  /** Create a plan for the given date and immediately generate AI meals. */
  createAndGenerate: async (date: string) => {
    // 1. Create the plan
    const planRes = await request<{ status: string; data: { plan: ApiMealPlan } }>(
      '/meal-plans',
      { method: 'POST', body: JSON.stringify({ date }) }
    )
    const planId = planRes.data.plan._id
    // 2. Generate AI meals
    const mealsRes = await request<{
      status: string
      results: number
      data: { meals: ApiMeal[] }
    }>(`/meal-plans/${planId}/generate`, { method: 'POST' })
    return { plan: planRes.data.plan, meals: mealsRes.data.meals }
  },

  /** Generate/regenerate AI meals for an existing plan. */
  generateMeals: (planId: string) =>
    request<{ status: string; results: number; data: { meals: ApiMeal[] } }>(
      `/meal-plans/${planId}/generate`,
      { method: 'POST' }
    ),
}

// ─── Meals ────────────────────────────────────────────────────────────────────

export const mealsApi = {
  update: (
    id: string,
    data: Partial<{
      type: string
      name: string
      calories: number
      description: string
      time: string
      ingredients: string[]
    }>
  ) =>
    request<{ status: string; data: { meal: ApiMeal } }>(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  toggleComplete: (id: string) =>
    request<{ status: string; data: { meal: ApiMeal } }>(
      `/meals/${id}/complete`,
      { method: 'PATCH' }
    ),

  delete: (id: string) => request<null>(`/meals/${id}`, { method: 'DELETE' }),
}

// ─── Rules ────────────────────────────────────────────────────────────────────

export const rulesApi = {
  getAll: () =>
    request<{ status: string; results: number; data: { rules: ApiRule[] } }>(
      '/rules'
    ),

  getById: (id: string) =>
    request<{ status: string; data: { rule: ApiRule } }>(`/rules/${id}`),

  create: (data: { description: string; isActive?: boolean }) =>
    request<{ status: string; data: { rule: ApiRule } }>('/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: { description?: string; isActive?: boolean }
  ) =>
    request<{ status: string; data: { rule: ApiRule } }>(`/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) => request<null>(`/rules/${id}`, { method: 'DELETE' }),
}