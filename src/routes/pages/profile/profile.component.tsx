import { Link } from "react-router-dom"
import { Mail, Lock, Trash2, Pencil } from "lucide-react"
import { Card, Input, Badge } from "../../../components/primitives/primitives.component"
import { Button } from "../../../components/button/button.component"
import { currentUser } from "../../../lib/mock-data"
import "./profile.styles.css"

export const Profile = () => {
  const healthStats = [
    { label: "Weight", value: `${currentUser.weight} kg` },
    { label: "Height", value: `${currentUser.height} cm` },
    { label: "Age", value: `${currentUser.age} yrs` },
    { label: "Goal", value: currentUser.goal },
    { label: "Diet", value: currentUser.dietType },
    { label: "Activity", value: currentUser.activityLevel },
  ]

  return (
    <div className="profile-container">
      <h1 className="profile-title">Profile</h1>

      {/* Header */}
      <Card className="profile-header-card">
        <div className="avatar-initials">
          {currentUser.initials}
        </div>
        <div className="profile-header-info">
          <h2 className="user-name-title">{currentUser.name}</h2>
          <p className="user-email-text">{currentUser.email}</p>
          <p className="member-since-tag">Member since {currentUser.memberSince}</p>
        </div>
      </Card>

      <div className="profile-split-grid">
        {/* Account settings */}
        <Card className="settings-card">
          <h2 className="settings-heading">Account Settings</h2>
          <Input id="p-name" label="Full name" defaultValue={currentUser.name} />
          <Input id="p-email" label="Email address" type="email" defaultValue={currentUser.email} />
          <Button variant="primary">
            <Mail size={18} /> Save Changes
          </Button>
          <div className="password-divider-row">
            <Button variant="outline" style={{ width: "100%" }}>
              <Lock size={18} /> Change Password
            </Button>
          </div>
          <div className="danger-zone-box">
            <p className="danger-zone-title">Danger Zone</p>
            <p className="danger-zone-desc">
              Permanently delete your account and all data.
            </p>
            <Button variant="destructive" size="sm" style={{ marginTop: "0.75rem" }}>
              <Trash2 size={16} /> Delete Account
            </Button>
          </div>
        </Card>

        {/* Health summary */}
        <Card className="settings-card">
          <div className="health-header-row">
            <h2 className="settings-heading">Health Summary</h2>
            <Link to="/setup">
              <Button variant="subtle" size="sm">
                <Pencil size={15} /> Edit Health Info
              </Button>
            </Link>
          </div>
          <div className="health-stats-grid">
            {healthStats.map((s) => (
              <div key={s.label} className="stat-metric-pill">
                <p className="stat-metric-label">{s.label}</p>
                <p className="stat-metric-val">{s.value}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="conditions-label">Conditions</p>
            <div className="conditions-cloud">
              {currentUser.conditions.length ? (
                currentUser.conditions.map((c) => (
                  <Badge key={c} tone="primary">{c}</Badge>
                ))
              ) : (
                <span className="no-conditions-text">None</span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}