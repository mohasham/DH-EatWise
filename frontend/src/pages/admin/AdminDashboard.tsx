import { useState, useEffect } from "react"
import { Users, UtensilsCrossed, ScrollText, UserPlus, Eye } from "lucide-react"
import { Card, Badge } from "../../components/ui/primitives"
import { usersApi, rulesApi, mealPlansApi, type ApiUser, type ApiRule } from "../../lib/api"
import { cn } from "../../lib/utils"
import styles from "./AdminDashboard.module.css"

export default function AdminDashboard() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [rules, setRules] = useState<ApiRule[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    Promise.all([
      usersApi.getAll(),
      rulesApi.getAll(),
      mealPlansApi.getAll({ startDate: today, endDate: today }),
    ])
      .then(([usersRes, rulesRes, plansRes]) => {
        setUsers(usersRes.data.users)
        setRules(rulesRes.data.rules)
        setTodayCount(plansRes.results)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function toggleRule(id: string, current: boolean) {
    try {
      const res = await rulesApi.update(id, { isActive: !current })
      setRules((prev) => prev.map((r) => (r._id === id ? res.data.rule : r)))
    } catch {
      // ignore
    }
  }

  const activeRules = rules.filter((r) => r.isActive)
  const newThisWeek = users.filter((u) => {
    const d = new Date(u.createdAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return d >= weekAgo
  }).length

  const stats = [
    { icon: Users, label: "Total Users", value: loading ? "..." : users.length.toLocaleString() },
//{ icon: UtensilsCrossed, label: "Plans Generated Today", value: loading ? "..." : todayCount.toLocaleString() },
    { icon: ScrollText, label: "Active Rules", value: loading ? "..." : activeRules.length.toString() },
    { icon: UserPlus, label: "New This Week", value: loading ? "..." : newThisWeek.toString() },
  ]

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>Operational overview of EatWise.</p>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {stats.map(({ icon: Icon, label, value }) => (
          <Card key={label} className={styles.statCard}>
            <div className={styles.statIcon}>
              <Icon size={22} />
            </div>
            <div className={styles.statBody}>
              <p className={styles.statLabel}>{label}</p>
              <p className={styles.statValue}>{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent users */}
      <Card className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Recent Users</h2>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.headRow}>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Joined</th>
                <th className={styles.th}>Profile</th>
                <th className={styles.th}>Role</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u._id} className={styles.bodyRow}>
                  <td className={styles.tdName}>{u.name}</td>
                  <td className={styles.tdMuted}>{u.email}</td>
                  <td className={styles.tdMuted}>
                    {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className={styles.td}>
                    <Badge tone={u.profileComplete ? "success" : "neutral"}>
                      {u.profileComplete ? "Complete" : "Incomplete"}
                    </Badge>
                  </td>
                  <td className={styles.td}>
                    <Badge tone={u.role === "admin" ? "accent" : "primary"}>{u.role}</Badge>
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && !loading && (
                <tr><td colSpan={5} className={styles.tdMuted}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Active rules */}
      <Card className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Active Rules</h2>
        </div>
        <div className={styles.rulesList}>
          {rules.length === 0 && !loading && (
            <p className={styles.tdMuted}>No rules yet.</p>
          )}
          {rules.map((r) => (
            <div key={r._id} className={styles.ruleRow}>
              <p className={styles.ruleText}>{r.description}</p>
              <button
                onClick={() => toggleRule(r._id, r.isActive)}
                className={cn(styles.toggle, r.isActive && styles.toggleOn)}
                aria-label="Toggle rule"
              >
                <span className={cn(styles.knob, r.isActive && styles.knobOn)} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
