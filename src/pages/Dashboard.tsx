import { useState } from "react"
import { Link } from "react-router-dom"
import { Flame, UtensilsCrossed, Target, CalendarClock, User, Check, Wand2 } from "lucide-react"
import { Card, Ring, Badge } from "@/components/ui/primitives"
import { currentUser, todaysMeals as initialMeals } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import styles from "./Dashboard.module.css"

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
})

export default function Dashboard() {
  const [meals, setMeals] = useState(initialMeals)
  const consumed = meals.filter((m) => m.eaten).reduce((s, m) => s + m.calories, 0)
  const target = currentUser.targetCalories
  const eatenCount = meals.filter((m) => m.eaten).length
  const pct = Math.round((consumed / target) * 100)

  function toggle(id: string) {
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, eaten: !m.eaten } : m)))
  }

  const stats = [
    { icon: Target, label: "Calorie Target", value: `${target.toLocaleString()}`, unit: "kcal" },
    { icon: UtensilsCrossed, label: "Meals Completed", value: `${eatenCount}/${meals.length}`, unit: "today" },
    { icon: Flame, label: "Current Goal", value: currentUser.goal, unit: "" },
  ]

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Good Morning, {currentUser.name.split(" ")[0]} 👋</h1>
        <p className={styles.date}>{today}</p>
      </div>

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
        <div className={cn(styles.mealRow, "no-scrollbar")}>
          {meals.map((meal) => (
            <Card key={meal.id} className={cn(styles.mealCard, meal.eaten && styles.mealCardEaten)}>
              <img src={meal.image || "/placeholder.svg"} alt={meal.name} className={styles.mealImg} />
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
                    onClick={() => toggle(meal.id)}
                    aria-label={meal.eaten ? "Mark as not eaten" : "Mark as eaten"}
                    className={cn(styles.checkBtn, meal.eaten && styles.checkBtnEaten)}
                  >
                    <Check size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
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
