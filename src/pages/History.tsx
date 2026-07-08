import { useState } from "react"
import {
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
import { Card, Ring, Badge } from "@/components/ui/primitives"
import { Button } from "@/components/ui/button"
import { weeklyCalories, recentPlans, todaysMeals, type RecentPlan } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import styles from "./History.module.css"

const statusTone: Record<string, "success" | "accent" | "neutral"> = {
  completed: "success",
  partial: "accent",
  skipped: "neutral",
}

// Build a simple month grid for the current month
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
  completed: styles.dotCompleted,
  partial: styles.dotPartial,
  skipped: styles.dotSkipped,
}

export default function History() {
  const { cells, monthName } = useMonthDays()
  const [selected, setSelected] = useState<RecentPlan | null>(null)

  const completionRate = Math.round(
    (recentPlans.reduce((s, p) => s + p.completed, 0) /
      recentPlans.reduce((s, p) => s + p.total, 0)) *
      100,
  )

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>History</h1>
        <p className={styles.subtitle}>Track your consistency over time.</p>
      </div>

      <div className={styles.topGrid}>
        {/* Weekly trend */}
        <Card className={styles.trendCard}>
          <h2 className={styles.cardHeading}>Weekly Calorie Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={weeklyCalories} margin={{ left: -18, right: 6 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="calories" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={34} />
              <Line dataKey="target" stroke="var(--color-accent)" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Completion rate */}
        <Card className={styles.completionCard}>
          <h2 className={styles.completionHeading}>This Week</h2>
          <Ring value={completionRate} size={140}>
            <span className={styles.ringValue}>{completionRate}%</span>
            <span className={styles.ringSub}>completed</span>
          </Ring>
          <p className={styles.completionCaption}>Meals completed this week</p>
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
            const status = day ? dayStatus[day] : undefined
            return (
              <div
                key={i}
                className={cn(
                  styles.calCell,
                  day && styles.calCellFilled,
                  status && styles.calCellActive,
                )}
                onClick={() => status && setSelected(recentPlans[0])}
              >
                {day && <span>{day}</span>}
                {status && <span className={cn(styles.dot, dotClass[status])} />}
              </div>
            )
          })}
        </div>
        <div className={styles.legend}>
          <span className={styles.legendItem}><span className={cn(styles.legendDot, styles.dotCompleted)} /> Completed</span>
          <span className={styles.legendItem}><span className={cn(styles.legendDot, styles.dotPartial)} /> Partial</span>
          <span className={styles.legendItem}><span className={cn(styles.legendDot, styles.dotSkipped)} /> Skipped</span>
        </div>
      </Card>

      {/* Recent plans */}
      <section>
        <h2 className={styles.sectionTitle}>Recent Plans</h2>
        <div className={styles.planList}>
          {recentPlans.map((p) => (
            <Card key={p.date} className={styles.planCard}>
              <div className={styles.planMain}>
                <p className={styles.planLabel}>{p.label}</p>
                <p className={styles.planCal}>{p.calories.toLocaleString()} kcal</p>
              </div>
              <div className={styles.planMeals}>
                {p.completed}/{p.total} meals
              </div>
              <Badge tone={statusTone[p.status]} className={styles.capitalize}>{p.status}</Badge>
              <Button variant="outline" size="sm" onClick={() => setSelected(p)}>View Plan</Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Side panel */}
      {selected && (
        <div className={styles.overlay}>
          <div className={styles.backdrop} onClick={() => setSelected(null)} />
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelTitle}>{selected.label}</h3>
              <button onClick={() => setSelected(null)} aria-label="Close"><X size={22} /></button>
            </div>
            <p className={styles.panelSub}>
              {selected.calories.toLocaleString()} kcal · {selected.completed}/{selected.total} meals
            </p>
            <div className={styles.panelList}>
              {todaysMeals.map((m) => (
                <div key={m.id} className={styles.panelRow}>
                  <img src={m.image || "/placeholder.svg"} alt={m.name} className={styles.panelImg} />
                  <div className={styles.panelRowMain}>
                    <p className={styles.panelRowName}>{m.name}</p>
                    <p className={styles.panelRowMeta}>{m.type} · {m.time}</p>
                  </div>
                  <span className={styles.panelRowCal}>{m.calories}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
