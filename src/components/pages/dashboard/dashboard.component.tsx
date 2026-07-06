import { useState } from "react"
import { Link } from "react-router-dom"
import { Flame, UtensilsCrossed, Target, CalendarClock, User, Check, Wand2 } from "lucide-react"
import { Card, Ring, Badge } from "@/components/ui/primitives"
import { currentUser, todaysMeals as initialMeals } from "@/lib/mock-data"
import "./dashboard.styles.css"

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
})

export const Dashboard = () => {
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
    <div className="dashboard-container">
      <div>
        <h1 className="dashboard-title">
          Good Morning, {currentUser.name.split(" ")[0]} 👋
        </h1>
        <p className="dashboard-subtitle">{today}</p>
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        <Card className="stat-card-center">
          <Ring value={pct} size={110} stroke={9}>
            <span className="ring-text-primary">{consumed.toLocaleString()}</span>
            <span className="ring-text-sub">of {target.toLocaleString()}</span>
          </Ring>
          <p className="stat-label-footer">Calories consumed</p>
        </Card>
        
        {stats.map(({ icon: Icon, label, value, unit }) => (
          <Card key={label} className="stat-card-split">
            <div className="stat-icon-wrapper">
              <Icon size={22} />
            </div>
            <div className="stat-content-block">
              <p className="stat-text-label">{label}</p>
              <p className="stat-text-value">
                {value} {unit && <span className="stat-text-unit">{unit}</span>}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Today's plan */}
      <section>
        <div className="section-header-row">
          <h2 className="section-title-sm">Today&apos;s Meal Plan</h2>
          <Link to="/meal-plan" className="section-link">
            View full plan
          </Link>
        </div>
        
        <div className="meal-carousel no-scrollbar">
          {meals.map((meal) => (
            <Card key={meal.id} className={`meal-card ${meal.eaten ? "meal-card-eaten" : ""}`}>
              <img src={meal.image} alt={meal.name} className="meal-image" />
              <div className="meal-body">
                <div className="meal-meta-row">
                  <Badge tone="primary">{meal.type}</Badge>
                  <span className="meal-time-stamp">{meal.time}</span>
                </div>
                <h3 className="meal-name-heading">{meal.name}</h3>
                <div className="meal-action-row">
                  <span className="meal-calories">
                    {meal.calories} <span className="meal-calories-unit">kcal</span>
                  </span>
                  <button
                    onClick={() => toggle(meal.id)}
                    aria-label={meal.eaten ? "Mark as not eaten" : "Mark as eaten"}
                    className={`btn-check-toggle ${meal.eaten ? "btn-check-active" : ""}`}
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
        <h2 className="section-title-sm" style={{ marginBottom: "1rem" }}>Quick Links</h2>
        <div className="quick-links-grid">
          {[
            { to: "/history", icon: CalendarClock, label: "History", text: "Review past plans" },
            { to: "/profile", icon: User, label: "Profile", text: "Manage your account" },
            { to: "/setup", icon: Wand2, label: "Edit Health Info", text: "Update your details" },
          ].map(({ to, icon: Icon, label, text }) => (
            <Link key={to} to={to}>
              <Card className="quick-link-card">
                <div className="stat-icon-wrapper">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="quick-link-title">{label}</p>
                  <p className="quick-link-desc">{text}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}