import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Flame, UtensilsCrossed, Target, CalendarClock, User, Check, Wand2, Loader2, Salad } from "lucide-react"
import { Card, Ring, Badge } from "../components/ui/primitives"
import { Button } from "../components/ui/button"
import { mealPlansApi, healthProfileApi, type ApiMeal, type ApiMealPlan, type ApiHealthProfile } from "../lib/api"
import { useAuth } from "../lib/auth-context"
import { cn, toLocalDateString } from "../lib/utils"
import styles from "./Dashboard.module.css"

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
})

const todayDateStr = toLocalDateString(new Date())

type MealWithLocal = ApiMeal & { _localEaten?: boolean }

export default function Dashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ApiHealthProfile | null>(null)
  const [plan, setPlan] = useState<ApiMealPlan | null>(null)
  const [meals, setMeals] = useState<MealWithLocal[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError("")
    try {
      const [profileRes, plansRes] = await Promise.all([
        healthProfileApi.get().catch(() => null),
        mealPlansApi.getAll({ startDate: todayDateStr, endDate: todayDateStr }).catch(() => null),
      ])
      if (profileRes) setProfile(profileRes.data.profile)
      if (plansRes && plansRes.data.plans.length > 0) {
        const todayPlan = plansRes.data.plans[0]
        setPlan(todayPlan)
        const mealsRes = await mealPlansApi.getMeals(todayPlan._id)
        setMeals(mealsRes.data.meals.map((m) => ({ ...m, _localEaten: m.completed })))
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data.")
    } finally {
      setLoading(false)
    }
  }

  async function generateTodayPlan() {
    setGenerating(true)
    setError("")
    try {
      const { plan: newPlan, meals: newMeals } = await mealPlansApi.createAndGenerate(todayDateStr)
      setPlan(newPlan)
      setMeals(newMeals.map((m) => ({ ...m, _localEaten: m.completed })))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate plan.")
    } finally {
      setGenerating(false)
    }
  }

  async function toggle(meal: MealWithLocal) {
    // Optimistic update
    setMeals((prev) =>
      prev.map((m) => (m._id === meal._id ? { ...m, _localEaten: !m._localEaten } : m))
    )
    try {
      await import("../lib/api").then(({ mealsApi }) => mealsApi.toggleComplete(meal._id))
    } catch {
      // Revert on failure
      setMeals((prev) =>
        prev.map((m) => (m._id === meal._id ? { ...m, _localEaten: meal._localEaten } : m))
      )
    }
  }

  const target = profile?.calorieTarget ?? 2000
  const consumed = meals.filter((m) => m._localEaten).reduce((s, m) => s + m.calories, 0)
  const eatenCount = meals.filter((m) => m._localEaten).length
  const pct = Math.round((consumed / target) * 100)
  const firstName = user?.name?.split(" ")[0] ?? "there"

  const goalLabel: Record<string, string> = {
    weight_loss: "Weight Loss",
    maintenance: "Maintenance",
    muscle_gain: "Muscle Gain",
    condition_management: "Condition Mgmt",
  }

  const stats = [
    { icon: Target, label: "Calorie Target", value: `${target.toLocaleString()}`, unit: "kcal" },
    { icon: UtensilsCrossed, label: "Meals Completed", value: plan ? `${eatenCount}/${meals.length}` : "—", unit: "today" },
    { icon: Flame, label: "Current Goal", value: profile ? (goalLabel[profile.goal] ?? profile.goal) : "—", unit: "" },
  ]

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Good Morning, {firstName}</h1>
        <p className={styles.date}>{today}</p>
      </div>

      {error && <p className={styles.errorBanner}>{error}</p>}

      {/* Stats row */}
      <div className={styles.statsGrid}>
        <Card className={styles.ringCard}>
          <Ring value={pct} size={110} stroke={9}>
            <span className={styles.ringValue}>{consumed.toLocaleString()}</span>
            <span className={styles.ringSub}>of {target.toLocaleString()}</span>
          </Ring>
          <p className={styles.ringCaption}>Calories consumed</p>
        </Card>
        {stats.map(({ icon: Icon, label, value, unit }) => (
          <Card key={label} className={styles.statCard}>
            <div className={styles.statIcon}>
              <Icon size={22} />
            </div>
            <div className={styles.statBody}>
              <p className={styles.statLabel}>{label}</p>
              <p className={styles.statValue}>
                {value} {unit && <span className={styles.statUnit}>{unit}</span>}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Today's plan */}
      <section>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Today&apos;s Meal Plan</h2>
          <Link to="/meal-plan" className={styles.viewLink}>
            View full plan
          </Link>
        </div>

        {loading ? (
          <div className={styles.loadingRow}>
            <Loader2 size={24} className={styles.spinner} />
            <span>Loading your plan...</span>
          </div>
        ) : meals.length === 0 ? (
          <Card className={styles.emptyCard}>
            <p className={styles.emptyText}>No meal plan for today yet.</p>
            {profile ? (
              <Button
                variant="accent"
                onClick={generateTodayPlan}
                disabled={generating}
              >
                {generating ? (
                  <><Loader2 size={16} className={styles.spinner} /> Generating...</>
                ) : (
                  <><Wand2 size={16} /> Generate Today&apos;s Plan</>
                )}
              </Button>
            ) : (
              <Link to="/setup">
                <Button variant="outline">Complete Your Profile First</Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className={cn(styles.mealRow, "no-scrollbar")}>
            {meals.map((meal) => (
              <Card key={meal._id} className={cn(styles.mealCard, meal._localEaten && styles.mealCardEaten)}>
                {meal.imgUrl ? (
                  <img src={meal.imgUrl} alt={meal.name} className={styles.mealImg} />
                ) : (
                  <div className={styles.mealImgPlaceholder}>
                    <Salad size={28} />
                  </div>
                )
                }
                <div className={styles.mealBody}>
                  <div className={styles.mealTop}>
                    <Badge tone="primary">{meal.type}</Badge>
                    <span className={styles.mealTime}>{meal.time}</span>
                  </div>
                  <h3 className={styles.mealName}>{meal.name}</h3>
                  <div className={styles.mealBottom}>
                    <span className={styles.mealCal}>
                      {meal.calories} <span className={styles.mealCalUnit}>kcal</span>
                    </span>
                    <button
                      onClick={() => toggle(meal)}
                      aria-label={meal._localEaten ? "Mark as not eaten" : "Mark as eaten"}
                      className={cn(styles.checkBtn, meal._localEaten && styles.checkBtnEaten)}
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Quick links */}
      <section>
        <h2 className={styles.quickTitle}>Quick Links</h2>
        <div className={styles.linksGrid}>
          {[
            { to: "/history", icon: CalendarClock, label: "History", text: "Review past plans" },
            { to: "/profile", icon: User, label: "Profile", text: "Manage your account" },
            { to: "/setup", icon: Wand2, label: "Edit Health Info", text: "Update your details" },
          ].map(({ to, icon: Icon, label, text }) => (
            <Link key={to} to={to}>
              <Card className={styles.linkCard}>
                <div className={styles.statIcon}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className={styles.linkLabel}>{label}</p>
                  <p className={styles.linkText}>{text}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
