import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, RefreshCw, Check, ChevronDown, Salad, Zap } from "lucide-react"
import { Card, Badge, Progress } from "../components/ui/primitives"
import { Button } from "../components/ui/button"
import { mealPlansApi, mealsApi, type ApiMealPlan, type ApiMeal } from "../lib/api"
import { useAuth } from "../lib/auth-context"
import { cn } from "../lib/utils"
import styles from "./MealPlan.module.css"

function toDateString(d: Date) {
  return d.toISOString().split("T")[0]
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
}

/** Format a 24h "HH:MM" string as 12-hour "h:MM AM/PM". */
function formatTime12h(time: string): string {
  const [hStr, mStr] = time.split(":")
  const h = Number(hStr)
  const period = h >= 12 ? "PM" : "AM"
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${mStr} ${period}`
}

const timingLabel: Record<string, string> = {
  pre_workout: "Pre-Workout",
  post_workout: "Post-Workout",
}

export default function MealPlan() {
  const { user } = useAuth()
  const [offset, setOffset] = useState(0)
  const [plan, setPlan] = useState<ApiMealPlan | null>(null)
  const [meals, setMeals] = useState<ApiMeal[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const date = new Date()
  date.setDate(date.getDate() + offset)
  const isToday = offset === 0
  const isFuture = offset > 0
  const dateStr = toDateString(date)

  const target = (user as { calorieTarget?: number } | null)?.calorieTarget ?? 2000
  const consumed = meals.filter((m) => m.completed).reduce((s, m) => s + m.calories, 0)
  const totalCals = meals.reduce((s, m) => s + m.calories, 0)

  const loadPlan = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const startDate = dateStr
      const endDate = dateStr
      const res = await mealPlansApi.getAll({ startDate, endDate })
      const found = res.data.plans[0] ?? null
      setPlan(found)
      if (found) {
        const mealsRes = await mealPlansApi.getMeals(found._id)
        setMeals(mealsRes.data.meals)
      } else {
        setMeals([])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load plan.")
    } finally {
      setLoading(false)
    }
  }, [dateStr])

  useEffect(() => {
    loadPlan()
  }, [loadPlan])

  async function generate() {
    setGenerating(true)
    setError("")
    try {
      if (plan) {
        // Regenerate: delete existing meals then generate again
        const res = await mealPlansApi.generateMeals(plan._id)
        setMeals(res.data.meals)
      } else {
        // Create plan + generate
        const res = await mealPlansApi.createAndGenerate(dateStr)
        setPlan(res.plan)
        setMeals(res.meals)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed.")
    } finally {
      setGenerating(false)
    }
  }

  async function toggleMeal(meal: ApiMeal) {
    try {
      const res = await mealsApi.toggleComplete(meal._id)
      setMeals((prev) =>
        prev.map((m) => (m._id === res.data.meal._id ? res.data.meal : m))
      )
    } catch {
      // silently fail — optimistic update not applied
    }
  }

  return (
    <div className={styles.page}>
      {/* Date nav */}
      <div className={styles.dateNav}>
        <div className={styles.dateControls}>
          <Button variant="outline" size="icon" onClick={() => setOffset(offset - 1)} aria-label="Previous day">
            <ChevronLeft size={18} />
          </Button>
          <div className={styles.dateLabel}>
            <p className={styles.dateName}>{formatDate(date)}</p>
            {isToday && <span className={styles.todayTag}>Today</span>}
          </div>
          <Button variant="outline" size="icon" onClick={() => setOffset(offset + 1)} aria-label="Next day">
            <ChevronRight size={18} />
          </Button>
        </div>
        <Button variant="primary" onClick={generate} disabled={generating || loading}>
          <RefreshCw size={18} className={cn(generating && styles.spin)} />
          {generating ? "Generating..." : plan ? "Regenerate Plan" : "Generate Plan"}
        </Button>
      </div>

      {error && <p className={styles.errorBanner}>{error}</p>}

      {loading ? (
        <Card className={styles.loadingCard}>
          <p className={styles.loadingText}>Loading plan...</p>
        </Card>
      ) : isFuture && !plan ? (
        <EmptyState onGenerate={generate} generating={generating} />
      ) : !plan || meals.length === 0 ? (
        <EmptyState onGenerate={generate} generating={generating} />
      ) : (
        <>
          {/* Calorie summary */}
          <Card className={styles.summaryCard}>
            <div className={styles.summaryTop}>
              <span className={styles.summaryLabel}>Daily calories</span>
              <span className={styles.summaryValue}>
                {consumed.toLocaleString()}{" "}
                <span className={styles.summaryTarget}>/ {totalCals.toLocaleString()} kcal</span>
              </span>
            </div>
            <Progress value={totalCals > 0 ? (consumed / totalCals) * 100 : 0} barTone="accent" />
          </Card>

          {/* Meal list */}
          <div className={styles.mealList}>
            {meals.map((meal) => {
              return (
                <Card key={meal._id} className={cn(styles.mealCard, meal.completed && styles.mealCardEaten)}>
                  <div className={styles.mealInner}>
                    {meal.imgUrl ? (
                      <img src={meal.imgUrl} alt={meal.name} className={styles.mealImg} />
                    ) : (
                      <div className={styles.mealImgPlaceholder}>
                        <Salad size={28} />
                      </div>
                    )}
                    <div className={styles.mealMain}>
                      <div className={styles.mealTags}>
                        <Badge tone="primary">{meal.type}</Badge>
                        {meal.timing !== "none" && (
                          <Badge tone="accent" className={styles.workoutBadge}>
                            <Zap size={11} /> {timingLabel[meal.timing]}
                          </Badge>
                        )}
                        <span className={styles.mealTime}>{formatTime12h(meal.time)}</span>
                      </div>
                      <h3 className={styles.mealName}>{meal.name}</h3>
                      <p className={styles.mealCal}>
                        {meal.calories} <span className={styles.mealCalUnit}>kcal</span>
                      </p>
                      <div className={styles.mealActions}>
                        <button
                          onClick={() => setExpanded(expanded === meal._id ? null : meal._id)}
                          className={styles.recipeToggle}
                        >
                          Recipe &amp; ingredients
                          <ChevronDown size={15} className={cn(styles.chevron, expanded === meal._id && styles.chevronOpen)} />
                        </button>
                        <button
                          onClick={() => toggleMeal(meal)}
                          className={cn(styles.eatBtn, meal.completed && styles.eatBtnEaten)}
                        >
                          <Check size={15} /> {meal.completed ? "Eaten" : "Mark as Eaten"}
                        </button>
                      </div>
                    </div>
                  </div>
                  {expanded === meal._id && (
                    <div className={styles.details}>
                      <p className={styles.detailsDesc}>{meal.description}</p>
                      {meal.ingredients.length > 0 && (
                        <div>
                          <p className={styles.detailsHeading}>Ingredients</p>
                          <div className={styles.ingredients}>
                            {meal.ingredients.map((ing) => (
                              <span key={ing} className={styles.ingredient}>
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {meal.recipe.length > 0 && (
                        <div>
                          <p className={styles.detailsHeading}>Recipe</p>
                          <ol className={styles.recipeSteps}>
                            {meal.recipe.map((step, i) => (
                              <li key={i} className={styles.recipeStep}>
                                <span className={styles.stepNum}>{i + 1}</span>
                                <span className={styles.stepText}>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function EmptyState({ onGenerate, generating }: { onGenerate: () => void; generating: boolean }) {
  return (
    <Card className={styles.empty}>
      <div className={styles.emptyIcon}>
        <Salad size={40} />
      </div>
      <div>
        <h3 className={styles.emptyTitle}>Plan not generated yet</h3>
        <p className={styles.emptyText}>
          We haven&apos;t built a meal plan for this day. Generate one tailored to your goals.
        </p>
      </div>
      <Button variant="accent" size="lg" onClick={onGenerate} disabled={generating}>
        <RefreshCw size={18} className={cn(generating && styles.spin)} />
        {generating ? "Generating..." : "Generate Plan"}
      </Button>
    </Card>
  )
}