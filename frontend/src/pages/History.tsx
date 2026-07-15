import { useState, useEffect } from "react"
import {
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { X } from "lucide-react"
import { Card, Ring, Badge } from "../components/ui/primitives"
import { Button } from "../components/ui/button"
import { mealPlansApi, type ApiMealPlan, type ApiMeal } from "../lib/api"
import { cn } from "../lib/utils"
import styles from "./History.module.css"

const statusTone: Record<string, "success" | "accent" | "neutral"> = {
  completed: "success",
  active: "accent",
  skipped: "neutral",
}

function useMonthDays() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return { cells, year, month, monthName: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }) }
}

function toISO(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function toDateString(d: Date) {
  return d.toISOString().split("T")[0]
}

export default function History() {
  const { cells, year, month, monthName } = useMonthDays()
  const [plans, setPlans] = useState<ApiMealPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<ApiMealPlan | null>(null)
  const [selectedMeals, setSelectedMeals] = useState<ApiMeal[]>([])
  const [loadingMeals, setLoadingMeals] = useState(false)
  const [loading, setLoading] = useState(true)

  const [weeklyData, setWeeklyData] = useState<{ day: string; calories: number }[]>([])
  const [weeklyLoading, setWeeklyLoading] = useState(true)

  // Load all plans for the current month
  useEffect(() => {
    const startDate = toISO(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const endDate = toISO(year, month, daysInMonth)
    mealPlansApi.getAll({ startDate, endDate })
      .then((res) => setPlans(res.data.plans))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [year, month])

  // Build a lookup: "YYYY-MM-DD" → plan
  const planByDate: Record<string, ApiMealPlan> = {}
  for (const p of plans) {
    planByDate[p.date.split("T")[0]] = p
  }

  // Weekly calorie trend = calories from meals actually marked eaten on each of
  // the last 7 days (not the plan's full totalCalories, which counts unfinished meals too).
  // Fetched independently of the month view since the 7-day window can span two months.
  useEffect(() => {
    let cancelled = false

    async function loadWeek() {
      setWeeklyLoading(true)
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d
      })

      try {
        const res = await mealPlansApi.getAll({
          startDate: toDateString(days[0]),
          endDate: toDateString(days[6]),
        })
        const byDate: Record<string, ApiMealPlan> = {}
        for (const p of res.data.plans) byDate[p.date.split("T")[0]] = p

        const results = await Promise.all(
          days.map(async (d) => {
            const label = d.toLocaleDateString("en-US", { weekday: "short" })
            const plan = byDate[toDateString(d)]
            if (!plan) return { day: label, calories: 0 }
            try {
              const mealsRes = await mealPlansApi.getMeals(plan._id)
              const eaten = mealsRes.data.meals
                .filter((m) => m.completed)
                .reduce((sum, m) => sum + m.calories, 0)
              return { day: label, calories: eaten }
            } catch {
              return { day: label, calories: 0 }
            }
          })
        )
        if (!cancelled) setWeeklyData(results)
      } catch {
        if (!cancelled) {
          setWeeklyData(
            days.map((d) => ({ day: d.toLocaleDateString("en-US", { weekday: "short" }), calories: 0 }))
          )
        }
      } finally {
        if (!cancelled) setWeeklyLoading(false)
      }
    }

    loadWeek()
    return () => {
      cancelled = true
    }
  }, [])

  // Completion stats from the plans in view
  const completedCount = plans.filter((p) => p.status === "completed").length
  const totalCount = plans.length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  async function openPlan(plan: ApiMealPlan) {
    setSelectedPlan(plan)
    setLoadingMeals(true)
    try {
      const res = await mealPlansApi.getMeals(plan._id)
      setSelectedMeals(res.data.meals)
    } catch {
      setSelectedMeals([])
    } finally {
      setLoadingMeals(false)
    }
  }

  const dotClass: Record<string, string> = {
    completed: styles.dotCompleted,
    active: styles.dotPartial,
    skipped: styles.dotSkipped,
  }

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>History</h1>
        <p className={styles.subtitle}>Track your consistency over time.</p>
      </div>

      <div className={styles.topGrid}>
        {/* Weekly calorie trend */}
        <Card className={styles.trendCard}>
          <h2 className={styles.cardHeading}>Weekly Calorie Trend</h2>
          {weeklyLoading ? (
            <p className={styles.loadingText}>Loading trend...</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={weeklyData} margin={{ left: -18, right: 6 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 13 }}
                />
                <Bar dataKey="calories" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={34} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Completion rate */}
        <Card className={styles.completionCard}>
          <h2 className={styles.completionHeading}>This Month</h2>
          <Ring value={completionRate} size={140}>
            <span className={styles.ringValue}>{completionRate}%</span>
            <span className={styles.ringSub}>completed</span>
          </Ring>
          <p className={styles.completionCaption}>{completedCount} of {totalCount} plans completed</p>
        </Card>
      </div>

      {/* Calendar */}
      <Card className={styles.calendarCard}>
        <h2 className={styles.cardHeading}>{monthName}</h2>
        <div className={styles.weekHead}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className={styles.weekHeadCell}>{d}</div>
          ))}
        </div>
        <div className={styles.calGrid}>
          {cells.map((day, i) => {
            const dateKey = day ? toISO(year, month, day) : ""
            const plan = day ? planByDate[dateKey] : undefined
            return (
              <div
                key={i}
                className={cn(
                  styles.calCell,
                  day && styles.calCellFilled,
                  plan && styles.calCellActive,
                )}
                onClick={() => plan && openPlan(plan)}
              >
                {day && <span>{day}</span>}
                {plan && <span className={cn(styles.dot, dotClass[plan.status] ?? styles.dotPartial)} />}
              </div>
            )
          })}
        </div>
        <div className={styles.legend}>
          <span className={styles.legendItem}><span className={cn(styles.legendDot, styles.dotCompleted)} /> Completed</span>
          <span className={styles.legendItem}><span className={cn(styles.legendDot, styles.dotPartial)} /> Active</span>
          <span className={styles.legendItem}><span className={cn(styles.legendDot, styles.dotSkipped)} /> Skipped</span>
        </div>
      </Card>

      {/* Recent plans list */}
      <section>
        <h2 className={styles.sectionTitle}>Recent Plans</h2>
        {loading ? (
          <p className={styles.loadingText}>Loading plans...</p>
        ) : plans.length === 0 ? (
          <p className={styles.emptyText}>No meal plans found for this month.</p>
        ) : (
          <div className={styles.planList}>
            {[...plans].reverse().map((p) => {
              const label = new Date(p.date).toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric",
              })
              return (
                <Card key={p._id} className={styles.planCard}>
                  <div className={styles.planMain}>
                    <p className={styles.planLabel}>{label}</p>
                    <p className={styles.planCal}>{p.totalCalories.toLocaleString()} kcal</p>
                  </div>
                  <Badge tone={statusTone[p.status] ?? "neutral"} className={styles.capitalize}>
                    {p.status}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => openPlan(p)}>View Plan</Button>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Side panel */}
      {selectedPlan && (
        <div className={styles.overlay}>
          <div className={styles.backdrop} onClick={() => setSelectedPlan(null)} />
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelTitle}>
                {new Date(selectedPlan.date).toLocaleDateString("en-US", {
                  weekday: "long", month: "short", day: "numeric",
                })}
              </h3>
              <button onClick={() => setSelectedPlan(null)} aria-label="Close"><X size={22} /></button>
            </div>
            <p className={styles.panelSub}>
              {selectedPlan.totalCalories.toLocaleString()} kcal
              &nbsp;·&nbsp;
              <Badge tone={statusTone[selectedPlan.status] ?? "neutral"}>{selectedPlan.status}</Badge>
            </p>
            <div className={styles.panelList}>
              {loadingMeals ? (
                <p className={styles.loadingText}>Loading meals...</p>
              ) : selectedMeals.length === 0 ? (
                <p className={styles.loadingText}>No meals recorded for this plan.</p>
              ) : (
                selectedMeals.map((m) => (
                  <div key={m._id} className={styles.panelRow}>
                    <img
                      src={m.imgUrl || "/placeholder.svg"}
                      alt={m.name}
                      className={styles.panelImg}
                    />
                    <div className={styles.panelRowMain}>
                      <p className={styles.panelRowName}>{m.name}</p>
                      <p className={styles.panelRowMeta}>
                        {m.type}&nbsp;·&nbsp;{m.time}
                        {m.completed && <span className={styles.eatenTag}> · eaten</span>}
                      </p>
                    </div>
                    <span className={styles.panelRowCal}>{m.calories} kcal</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}