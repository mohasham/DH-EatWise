import { useState } from "react"
import { Users, UtensilsCrossed, ScrollText, UserPlus, Eye } from "lucide-react"
import { Card, Badge } from "@/components/ui/primitives"
import { Button } from "@/components/ui/button"
import { adminUsers, adminRules } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import styles from "./AdminDashboard.module.css"

const stats = [
  { icon: Users, label: "Total Users", value: "1,284" },
  { icon: UtensilsCrossed, label: "Plans Generated Today", value: "342" },
  { icon: ScrollText, label: "Active Rules", value: "3" },
  { icon: UserPlus, label: "New This Week", value: "48" },
]

export default function AdminDashboard() {
  const [rules, setRules] = useState(adminRules)

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
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.slice(0, 5).map((u) => (
                <tr key={u.id} className={styles.bodyRow}>
                  <td className={styles.tdName}>{u.name}</td>
                  <td className={styles.tdMuted}>{u.email}</td>
                  <td className={styles.tdMuted}>{u.joined}</td>
                  <td className={styles.td}>
                    <Badge tone={u.complete ? "success" : "neutral"}>{u.complete ? "Complete" : "Incomplete"}</Badge>
                  </td>
                  <td className={styles.td}>
                    <Button variant="ghost" size="sm"><Eye size={16} /> View</Button>
                  </td>
                </tr>
              ))}
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
          {rules.map((r) => (
            <div key={r.id} className={styles.ruleRow}>
              <p className={styles.ruleText}>{r.description}</p>
              <button
                onClick={() => setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, active: !x.active } : x)))}
                className={cn(styles.toggle, r.active && styles.toggleOn)}
                aria-label="Toggle rule"
              >
                <span className={cn(styles.knob, r.active && styles.knobOn)} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
