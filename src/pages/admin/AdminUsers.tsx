import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Search, Eye, Trash2, X } from "lucide-react"
import { Card, Badge } from "@/components/ui/primitives"
import { Button } from "@/components/ui/button"
import { adminUsers, currentUser, todaysMeals, type AdminUser } from "@/lib/mock-data"
import styles from "./AdminUsers.module.css"

export default function AdminUsers() {
  const [query, setQuery] = useState("")
  const [role, setRole] = useState<"all" | "user" | "admin">("all")
  const [selected, setSelected] = useState<AdminUser | null>(null)

  useEffect(() => {
    if (!selected) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [selected])

  const filtered = adminUsers.filter((u) => {
    const matchesQuery =
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
    const matchesRole = role === "all" || u.role === role
    return matchesQuery && matchesRole
  })

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Users</h1>
        <p className={styles.subtitle}>Manage all user accounts.</p>
      </div>

      {/* Search + filter */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={18} className={styles.searchIcon} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className={styles.searchInput}
          />
        </div>
        <div className={styles.roleButtons}>
          {(["all", "user", "admin"] as const).map((r) => (
            <Button key={r} variant={role === r ? "primary" : "outline"} size="sm" className={styles.capitalize} onClick={() => setRole(r)}>
              {r}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className={styles.sectionCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeadRow}>
                <th className={styles.tableHeadCell}>User</th>
                <th className={styles.tableHeadCell}>Role</th>
                <th className={styles.tableHeadCell}>Profile</th>
                <th className={styles.tableHeadCell}>Joined</th>
                <th className={styles.tableHeadCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>
                        {u.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className={styles.userName}>{u.name}</p>
                        <p className={styles.userEmail}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <Badge tone={u.role === "admin" ? "accent" : "primary"} className={styles.capitalize}>{u.role}</Badge>
                  </td>
                  <td className={styles.tableCell}>
                    <Badge tone={u.complete ? "success" : "neutral"}>{u.complete ? "Complete" : "Incomplete"}</Badge>
                  </td>
                  <td className={styles.tableCellMuted}>{u.joined}</td>
                  <td className={styles.tableCell}>
                    <div className={styles.rowActions}>
                      <Button variant="ghost" size="sm" onClick={() => setSelected(u)}><Eye size={16} /> View</Button>
                      <Button variant="ghost" size="icon" aria-label="Delete"><Trash2 size={16} className={styles.destructiveIcon} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className={styles.emptyCell}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail panel */}
      {selected &&
        createPortal(
          <div className={styles.overlay}>
            <div className={styles.overlayBackdrop} onClick={() => setSelected(null)} />
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3 className={styles.panelTitle}>User Detail</h3>
                <button onClick={() => setSelected(null)} aria-label="Close"><X size={22} /></button>
              </div>
              <div className={styles.panelProfile}>
                <div className={styles.avatarLg}>
                  {selected.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className={styles.panelName}>{selected.name}</p>
                  <p className={styles.panelEmail}>{selected.email}</p>
                </div>
              </div>

              <h4 className={styles.sectionLabel}>Health Profile</h4>
              <div className={styles.statGrid}>
                {[
                  { l: "Goal", v: currentUser.goal },
                  { l: "Diet", v: currentUser.dietType },
                  { l: "Weight", v: `${currentUser.weight} kg` },
                  { l: "Height", v: `${currentUser.height} cm` },
                ].map((s) => (
                  <div key={s.l} className={styles.statBox}>
                    <p className={styles.statBoxLabel}>{s.l}</p>
                    <p className={styles.statBoxValue}>{s.v}</p>
                  </div>
                ))}
              </div>

              <h4 className={styles.sectionLabel}>Recent Meal Plan</h4>
              <div className={styles.mealList}>
                {todaysMeals.map((m) => (
                  <div key={m.id} className={styles.mealRow}>
                    <img src={m.image} alt={m.name} className={styles.mealImage} />
                    <div className={styles.mealInfo}>
                      <p className={styles.mealName}>{m.name}</p>
                      <p className={styles.mealType}>{m.type}</p>
                    </div>
                    <span className={styles.mealCalories}>{m.calories}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}