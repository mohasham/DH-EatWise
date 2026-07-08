import { useState } from "react"
import { ChevronLeft, ChevronRight, RefreshCw, Check, ChevronDown, Salad } from "lucide-react"
import { Card, Badge, Progress } from "@/components/ui/primitives"
import { Button } from "@/components/ui/button"
import { currentUser, todaysMeals, buildDayMeals, buildSnacksFromCount } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import styles from "./MealPlan.module.css"

// Full day plan = main meals with the user's snacks auto-distributed around meals & workouts.
const initialMeals = buildDayMeals(todaysMeals, buildSnacksFromCount(currentUser.snackCount))

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
}

export default function MealPlan() {
  const [offset, setOffset] = useState(0)
  const [meals, setMeals] = useState(initialMeals)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const date = new Date()
  date.setDate(date.getDate() + offset)
  const isToday = offset === 0
  const isFuture = offset > 0

  const consumed = meals.filter((m) => m.eaten).reduce((s, m) => s + m.calories, 0)
  const target = currentUser.targetCalories

  function toggle(id: string) {
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, eaten: !m.eaten } : m)))
  }

  function generate() {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setOffset(0)
    }, 900)
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
        <Button variant="primary" onClick={generate} disabled={generating}>
          <RefreshCw size={18} className={cn(generating && styles.spin)} />
          {generating ? "Regenerating..." : "Regenerate Plan"}
        </Button>
      </div>

      {isFuture ? (
        <EmptyState onGenerate={generate} generating={generating} />
      ) : (
        <>
          {/* Calorie summary */}
          <Card className={styles.summaryCard}>
            <div className={styles.summaryTop}>
              <span className={styles.summaryLabel}>Daily calories</span>
              <span className={styles.summaryValue}>
                {consumed.toLocaleString()}{" "}
                <span className={styles.summaryTarget}>/ {target.toLocaleString()} kcal</span>
              </span>
            </div>
            <Progress value={(consumed / target) * 100} barTone="accent" />
          </Card>

          {/* Meal list */}
          <div className={styles.mealList}>
            {meals.map((meal) => (
              <Card key={meal.id} className={cn(styles.mealCard, meal.eaten && styles.mealCardEaten)}>
                <div className={styles.mealInner}>
                  <img src={meal.image || "/placeholder.svg"} alt={meal.name} className={styles.mealImg} />
                  <div className={styles.mealMain}>
                    <div className={styles.mealTags}>
                      <Badge tone="primary">{meal.type}</Badge>
                      {meal.timing && <Badge tone="accent">{meal.timing}</Badge>}
                      <span className={styles.mealTime}>{meal.time}</span>
                    </div>
                    <h3 className={styles.mealName}>{meal.name}</h3>
                    <p className={styles.mealCal}>
                      {meal.calories} <span className={styles.mealCalUnit}>kcal</span>
                    </p>
                    <div className={styles.mealActions}>
                      <button
                        onClick={() => setExpanded(expanded === meal.id ? null : meal.id)}
                        className={styles.recipeToggle}
                      >
                        Recipe &amp; ingredients
                        <ChevronDown size={15} className={cn(styles.chevron, expanded === meal.id && styles.chevronOpen)} />
                      </button>
                      <button
                        onClick={() => toggle(meal.id)}
                        className={cn(styles.eatBtn, meal.eaten && styles.eatBtnEaten)}
                      >
                        <Check size={15} /> {meal.eaten ? "Eaten" : "Mark as Eaten"}
                      </button>
                    </div>
                  </div>
                </div>
                {expanded === meal.id && (
                  <div className={styles.details}>
                    <p className={styles.detailsDesc}>{meal.description}</p>
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
                  </div>
                )}
              </Card>
            ))}
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
