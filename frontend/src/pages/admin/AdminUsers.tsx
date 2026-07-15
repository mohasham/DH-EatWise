import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Search, Trash2, X } from "lucide-react"
import { Card, Badge } from "../../components/ui/primitives"
import { Button } from "../../components/ui/button"
import { usersApi, healthProfileApi, type ApiUser, type ApiHealthProfile } from "../../lib/api"
import styles from "./AdminUsers.module.css"

export default function AdminUsers() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [role, setRole] = useState<"all" | "user" | "admin">("all")
  const [selected, setSelected] = useState<ApiUser | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<ApiHealthProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    usersApi.getAll()
      .then((res) => setUsers(res.data.users))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = original }
  }, [selected])

  async function openUser(u: ApiUser) {
    setSelected(u)
    setSelectedProfile(null)
    setProfileLoading(true)
    // Admins can't currently fetch another user's health profile via the API
    // so we just load the overview panel with user info
    setProfileLoading(false)
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user permanently?")) return
    try {
      await usersApi.delete(id)
      setUsers((prev) => prev.filter((u) => u._id !== id))
      if (selected?._id === id) setSelected(null)
    } catch {
      // ignore
    }
  }

  const filtered = users.filter((u) => {
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

      {/* Toolbar */}
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
              {loading ? (
                <tr><td colSpan={5} className={styles.emptyCell}>Loading users...</td></tr>
              ) : filtered.map((u) => (
                <tr key={u._id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>
                        {u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
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
                    <Badge tone={u.profileComplete ? "success" : "neutral"}>
                      {u.profileComplete ? "Complete" : "Incomplete"}
                    </Badge>
                  </td>
                  <td className={styles.tableCellMuted}>
                    {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.rowActions}>
                      <Button variant="ghost" size="sm" onClick={() => openUser(u)}>View</Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete user"
                        onClick={() => deleteUser(u._id)}
                      >
                        <Trash2 size={16} className={styles.destructiveIcon} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
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
                  {selected.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className={styles.panelName}>{selected.name}</p>
                  <p className={styles.panelEmail}>{selected.email}</p>
                </div>
              </div>

              <h4 className={styles.sectionLabel}>Account Info</h4>
              <div className={styles.statGrid}>
                {[
                  { l: "Role", v: selected.role },
                  { l: "Profile", v: selected.profileComplete ? "Complete" : "Incomplete" },
                  {
                    l: "Joined",
                    v: new Date(selected.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    }),
                  },
                  { l: "ID", v: selected._id.slice(-8) },
                ].map((s) => (
                  <div key={s.l} className={styles.statBox}>
                    <p className={styles.statBoxLabel}>{s.l}</p>
                    <p className={styles.statBoxValue}>{s.v}</p>
                  </div>
                ))}
              </div>

              <div className={styles.panelActions}>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteUser(selected._id)}
                >
                  <Trash2 size={15} /> Delete User
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
