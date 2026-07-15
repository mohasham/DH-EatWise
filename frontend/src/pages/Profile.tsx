import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Mail, Lock, Trash2, Pencil, Save } from "lucide-react"
import { Card, Input, Badge } from "../components/ui/primitives"
import { Button } from "../components/ui/button"
import { useAuth } from "../lib/auth-context"
import { usersApi, healthProfileApi, type ApiHealthProfile } from "../lib/api"
import styles from "./Profile.module.css"

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const [profile, setProfile] = useState<ApiHealthProfile | null>(null)
  const [name, setName] = useState(user?.name ?? "")
  const [email] = useState(user?.email ?? "")
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState("")
  const [saveErr, setSaveErr] = useState("")
  const [deleting, setDeleting] = useState(false)

  // Load health profile
  useEffect(() => {
    healthProfileApi.get()
      .then((res) => setProfile(res.data.profile))
      .catch(() => {})
  }, [])

  async function saveChanges(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg("")
    setSaveErr("")
    try {
      const res = await usersApi.update(user!._id, { name })
      setUser(res.data.user)
      setSaveMsg("Changes saved successfully.")
    } catch (err: unknown) {
      setSaveErr(err instanceof Error ? err.message : "Failed to save changes.")
    } finally {
      setSaving(false)
    }
  }

  async function deleteAccount() {
    if (!confirm("Are you sure? This will permanently delete your account and all data.")) return
    setDeleting(true)
    try {
      await usersApi.delete(user!._id)
      await logout()
    } catch {
      setDeleting(false)
    }
  }

  const healthStats = profile
    ? [
        { label: "Weight", value: `${profile.weight} kg` },
        { label: "Height", value: `${profile.height} cm` },
        { label: "Age", value: `${profile.age} yrs` },
        { label: "Goal", value: profile.goal },
        { label: "Diet", value: profile.dietaryPreference.join(", ") || "—" },
        { label: "Activity", value: profile.activityLevel },
      ]
    : []

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Profile</h1>

      {/* Header card */}
      <Card className={styles.headerCard}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.headerText}>
          <h2 className={styles.name}>{user?.name}</h2>
          <p className={styles.email}>{user?.email}</p>
          <p className={styles.memberSince}>
            Member since{" "}
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
              : "—"}
          </p>
        </div>
      </Card>

      <div className={styles.grid}>
        {/* Account settings */}
        <Card className={styles.settingsCard}>
          <h2 className={styles.cardHeading}>Account Settings</h2>
          <form onSubmit={saveChanges} className={styles.settingsForm}>
            <Input
              id="p-name"
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              id="p-email"
              label="Email address"
              type="email"
              value={email}
              readOnly
              disabled
            />
            {saveMsg && <p className={styles.successMsg}>{saveMsg}</p>}
            {saveErr && <p className={styles.errorMsg}>{saveErr}</p>}
            <Button type="submit" variant="primary" disabled={saving}>
              <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
          <div className={styles.divider}>
            <Button variant="outline" className={styles.fullWidth} disabled>
              <Lock size={18} /> Change Password
            </Button>
          </div>
          <div className={styles.dangerZone}>
            <p className={styles.dangerTitle}>Danger Zone</p>
            <p className={styles.dangerText}>Permanently delete your account and all data.</p>
            <Button variant="destructive" size="sm" className={styles.dangerBtn} onClick={deleteAccount} disabled={deleting}>
              <Trash2 size={16} /> {deleting ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </Card>

        {/* Health summary */}
        <Card className={styles.healthCard}>
          <div className={styles.healthHead}>
            <h2 className={styles.cardHeading}>Health Summary</h2>
            <Link to="/setup">
              <Button variant="subtle" size="sm">
                <Pencil size={15} /> Edit Health Info
              </Button>
            </Link>
          </div>
          {profile ? (
            <>
              <div className={styles.statGrid}>
                {healthStats.map((s) => (
                  <div key={s.label} className={styles.statBox}>
                    <p className={styles.statLabel}>{s.label}</p>
                    <p className={styles.statValue}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className={styles.conditionsLabel}>Conditions</p>
                <div className={styles.conditionsRow}>
                  {profile.conditions.length ? (
                    profile.conditions.map((c) => (
                      <Badge key={c} tone="primary">{c}</Badge>
                    ))
                  ) : (
                    <span className={styles.conditionsNone}>None</span>
                  )}
                </div>
              </div>
              {profile.allergies.length > 0 && (
                <div>
                  <p className={styles.conditionsLabel}>Allergies</p>
                  <div className={styles.conditionsRow}>
                    {profile.allergies.map((a) => (
                      <Badge key={a} tone="accent">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className={styles.noProfile}>
              No health profile yet.{" "}
              <Link to="/setup" className={styles.setupLink}>
                Complete your setup
              </Link>
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
