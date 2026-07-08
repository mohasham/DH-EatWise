import { Link } from "react-router-dom"
import { Mail, Lock, Trash2, Pencil } from "lucide-react"
import { Card, Input, Badge } from "@/components/ui/primitives"
import { Button } from "@/components/ui/button"
import { currentUser } from "@/lib/mock-data"
import styles from "./Profile.module.css"

export default function Profile() {
  const healthStats = [
    { label: "Weight", value: `${currentUser.weight} kg` },
    { label: "Height", value: `${currentUser.height} cm` },
    { label: "Age", value: `${currentUser.age} yrs` },
    { label: "Goal", value: currentUser.goal },
    { label: "Diet", value: currentUser.dietType },
    { label: "Activity", value: currentUser.activityLevel },
  ]

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Profile</h1>

      {/* Header */}
      <Card className={styles.headerCard}>
        <div className={styles.avatar}>{currentUser.initials}</div>
        <div className={styles.headerText}>
          <h2 className={styles.name}>{currentUser.name}</h2>
          <p className={styles.email}>{currentUser.email}</p>
          <p className={styles.memberSince}>Member since {currentUser.memberSince}</p>
        </div>
      </Card>

      <div className={styles.grid}>
        {/* Account settings */}
        <Card className={styles.settingsCard}>
          <h2 className={styles.cardHeading}>Account Settings</h2>
          <Input id="p-name" label="Full name" defaultValue={currentUser.name} />
          <Input id="p-email" label="Email address" type="email" defaultValue={currentUser.email} />
          <Button variant="primary">
            <Mail size={18} /> Save Changes
          </Button>
          <div className={styles.divider}>
            <Button variant="outline" className={styles.fullWidth}>
              <Lock size={18} /> Change Password
            </Button>
          </div>
          <div className={styles.dangerZone}>
            <p className={styles.dangerTitle}>Danger Zone</p>
            <p className={styles.dangerText}>
              Permanently delete your account and all data.
            </p>
            <Button variant="destructive" size="sm" className={styles.dangerBtn}>
              <Trash2 size={16} /> Delete Account
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
              {currentUser.conditions.length ? (
                currentUser.conditions.map((c) => (
                  <Badge key={c} tone="primary">{c}</Badge>
                ))
              ) : (
                <span className={styles.conditionsNone}>None</span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
