import { useState } from "react"
import {
  BarChart,
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { X } from "lucide-react"
import { Card, Ring, Badge } from "../../../components/primitives/primitives.component"
import { Button } from "../../../components/button/button.component"
import { weeklyCalories, recentPlans, todaysMeals, type RecentPlan } from "../../../lib/mock-data"
import "./history.styles.css"

const statusTone: Record<string, "success" | "accent" | "neutral"> = {
  completed: "success",
  partial: "accent",
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
  return { cells, monthName: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }) }
}

const dayStatus: Record<number, "completed" | "partial" | "skipped"> = {
  1: "completed", 2: "completed", 3: "partial", 4: "skipped", 5: "completed",
  8: "completed", 9: "partial", 10: "completed", 11: "completed", 15: "completed",
  16: "skipped", 17: "partial", 18: "completed", 22: "completed", 23: "completed",
}

const dotClass: Record<string, string> = {
  completed: "dot-completed",
  partial: "dot-partial",
  skipped: "dot-skipped",
}

export const History = () => {
  const { cells, monthName } = useMonthDays()
  const [selected, setSelected] = useState<RecentPlan | null>(null)

  const completionRate = Math.round(
    (recentPlans.reduce((s, p) => s + p.completed, 0) /
      recentPlans.reduce((s, p) => s + p.total, 0)) *
    100,
  )

  return (
    <div className="history-container">
      <div>
        <h1 className="history-title">History</h1>
        <p className="history-subtitle">Track your consistency over time.</p>
      </div>

      <div className="analytics-grid">
        {/* Weekly trend */}
        <Card className="chart-card col-span-2">
          <h2 className="chart-title">Weekly Calorie Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={weeklyCalories} margin={{ left: -18, right: 6 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="calories" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={34} />
              <Line dataKey="target" stroke="var(--accent)" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Completion rate */}
        <Card className="rate-card-center">
          <h2 className="rate-card-title">This Week</h2>
          <Ring value={completionRate} size={140}>
            <span className="rate-pct">{completionRate}%</span>
            <span className="rate-sub">completed</span>
          </Ring>
          <p className="rate-footer-text">Meals completed this week</p>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="calendar-card">
        <h2 className="calendar-header-title">{monthName}</h2>
        <div className="calendar-weekdays-row">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="weekday-cell">{d}</div>
          ))}
        </div>
        <div className="calendar-days-grid">
          {cells.map((day, i) => {
            const status = day ? dayStatus[day] : undefined
            const computedDayClass = `day-cell ${day ? "day-cell-active" : ""} ${status ? "day-cell-clickable" : ""}`

            return (
              <div
                key={i}
                className={computedDayClass}
                onClick={() => status && setSelected(recentPlans[0])}
              >
                {day && <span>{day}</span>}
                {status && <span className={`day-dot ${dotClass[status]}`} />}
              </div>
            )
          })}
        </div>
        <div className="calendar-legend-row">
          <span className="legend-item"><span className="legend-circle" style={{ backgroundColor: "var(--success)" }} /> Completed</span>
          <span className="legend-item"><span className="legend-circle" style={{ backgroundColor: "var(--accent)" }} /> Partial</span>
          <span className="legend-item"><span className="legend-circle" style={{ backgroundColor: "rgba(107, 106, 99, 0.4)" }} /> Skipped</span>
        </div>
      </Card>

      {/* Recent plans */}
      <section>
        <h2 className="section-heading-sm">Recent Plans</h2>
        <div className="plans-vertical-stack">
          {recentPlans.map((p) => (
            <Card key={p.date} className="plan-row-card">
              <div className="plan-info-block">
                <p className="plan-info-title">{p.label}</p>
                <p className="plan-info-sub">{p.calories.toLocaleString()} kcal</p>
              </div>
              <div className="plan-meta-meals">
                {p.completed}/{p.total} meals
              </div>
              <Badge tone={statusTone[p.status]} className="plan-badge-status">{p.status}</Badge>
              <Button variant="outline" size="sm" onClick={() => setSelected(p)}>View Plan</Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Side panel */}
      {selected && (
        <div className="drawer-backdrop">
          <div className="drawer-scrim" onClick={() => setSelected(null)} />
          <div className="drawer-content-box">
            <div className="drawer-header-row">
              <h3 className="drawer-header-title">{selected.label}</h3>
              <button className="drawer-close-btn" onClick={() => setSelected(null)} aria-label="Close">
                <X size={22} />
              </button>
            </div>
            <p className="drawer-subtitle">
              {selected.calories.toLocaleString()} kcal · {selected.completed}/{selected.total} meals
            </p>
            <div className="drawer-items-list">
              {todaysMeals.map((m) => (
                <div key={m.id} className="drawer-meal-item">
                  <img src={m.image} alt={m.name} className="drawer-meal-thumb" />
                  <div className="drawer-meal-info">
                    <p className="drawer-meal-name">{m.name}</p>
                    <p className="drawer-meal-meta">{m.type} · {m.time}</p>
                  </div>
                  <span className="drawer-meal-kcal">{m.calories}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}