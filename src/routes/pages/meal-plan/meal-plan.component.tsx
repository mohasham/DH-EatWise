import { useState } from "react"
import { ChevronLeft, ChevronRight, RefreshCw, Check, ChevronDown, Salad } from "lucide-react"
import { Card, Badge, Progress } from "../../../components/primitives/primitives.component"
import { Button } from "../../../components/button/button.component"
import { currentUser, todaysMeals, buildDayMeals, buildSnacksFromCount } from "../../../lib/mock-data"
import "./meal-plan.styles.css"

const initialMeals = buildDayMeals(todaysMeals, buildSnacksFromCount(currentUser.snackCount))

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
}

export const MealPlan = () => {
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
    <div className="meal-plan-container">
      {/* Date nav */}
      <div className="date-nav-bar">
        <div className="date-controls-group">
          <Button variant="outline" size="icon" onClick={() => setOffset(offset - 1)} aria-label="Previous day">
            <ChevronLeft size={18} />
          </Button>
          <div className="date-label-wrapper">
            <p className="date-label-text">{formatDate(date)}</p>
            {isToday && <span className="date-today-badge">Today</span>}
          </div>
          <Button variant="outline" size="icon" onClick={() => setOffset(offset + 1)} aria-label="Next day">
            <ChevronRight size={18} />
          </Button>
        </div>
        <Button variant="primary" onClick={generate} disabled={generating}>
          <RefreshCw size={18} className={generating ? "animate-spin-icon" : ""} />
          {generating ? "Regenerating..." : "Regenerate Plan"}
        </Button>
      </div>

      {isFuture ? (
        <EmptyState onGenerate={generate} generating={generating} />
      ) : (
        <>
          {/* Calorie summary */}
          <Card className="macro-summary-card">
            <div className="macro-stats-row">
              <span className="macro-label">Daily calories</span>
              <span className="macro-numerical-value">
                {consumed.toLocaleString()}{" "}
                <span className="macro-muted-unit">/ {target.toLocaleString()} kcal</span>
              </span>
            </div>
            <Progress value={(consumed / target) * 100} barClassName="bg-accent" />
          </Card>

          {/* Meal list */}
          <div className="meal-list-stack">
            {meals.map((meal) => {
              const cardClassName = `meal-item-card ${meal.eaten ? "meal-item-card-eaten" : ""}`
              const chevronClassName = `chevron-rotate-icon ${expanded === meal.id ? "chevron-rotated" : ""}`
              const actionBtnClassName = `status-eaten-toggle-btn ${meal.eaten ? "btn-state-completed" : "btn-state-uncompleted"}`

              return (
                <Card key={meal.id} className={cardClassName}>
                  <div className="meal-card-body">
                    <img src={meal.image} alt={meal.name} className="meal-media-thumb" />
                    <div className="meal-details-column">
                      <div className="meal-badges-row">
                        <Badge tone="primary">{meal.type}</Badge>
                        {meal.timing && <Badge tone="accent">{meal.timing}</Badge>}
                        <span className="meal-timestamp">{meal.time}</span>
                      </div>
                      <h3 className="meal-title-text">{meal.name}</h3>
                      <p className="meal-calories-display">
                        {meal.calories} <span className="macro-muted-unit">kcal</span>
                      </p>
                      <div className="meal-actions-footer-row">
                        <button
                          onClick={() => setExpanded(expanded === meal.id ? null : meal.id)}
                          className="recipe-toggle-trigger"
                        >
                          Recipe &amp; ingredients
                          <ChevronDown size={15} className={chevronClassName} />
                        </button>
                        <button onClick={() => toggle(meal.id)} className={actionBtnClassName}>
                          <Check size={15} /> {meal.eaten ? "Eaten" : "Mark as Eaten"}
                        </button>
                      </div>
                    </div>
                  </div>
                  {expanded === meal.id && (
                    <div className="recipe-expanded-drawer">
                      <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.625, color: "var(--muted-foreground)" }}>{meal.description}</p>
                      <div>
                        <p className="recipe-section-label">Ingredients</p>
                        <div className="ingredients-pill-cloud">
                          {meal.ingredients.map((ing) => (
                            <span key={ing} className="ingredient-item-tag">
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="recipe-section-label">Recipe</p>
                        <ol className="recipe-steps-ordered-list">
                          {meal.recipe.map((step, i) => (
                            <li key={i} className="recipe-step-item">
                              <span className="recipe-step-index-badge">
                                {i + 1}
                              </span>
                              <span style={{ color: "var(--foreground)" }}>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
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

interface EmptyStateProps {
  onGenerate: () => void
  generating: boolean
}

function EmptyState({ onGenerate, generating }: EmptyStateProps) {
  return (
    <Card className="empty-state-view">
      <div className="empty-state-icon-circle">
        <Salad size={40} />
      </div>
      <div>
        <h3 className="empty-state-headline">Plan not generated yet</h3>
        <p className="empty-state-subtext">
          We haven&apos;t built a meal plan for this day. Generate one tailored to your goals.
        </p>
      </div>
      <Button variant="accent" size="lg" onClick={onGenerate} disabled={generating}>
        <RefreshCw size={18} className={generating ? "animate-spin-icon" : ""} />
        {generating ? "Generating..." : "Generate Plan"}
      </Button>
    </Card>
  )
}