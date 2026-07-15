import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { LayoutDashboard, UtensilsCrossed, CalendarClock, User, LogOut } from "lucide-react"
import { Logo } from "../components/logo"
import { useAuth } from "../lib/auth-context"
import { cn } from "../lib/utils"
import styles from "./app-layout.module.css"

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/meal-plan", label: "Meal Plan", icon: UtensilsCrossed },
  { to: "/history", label: "History", icon: CalendarClock },
  { to: "/profile", label: "Profile", icon: User },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate("/login")
  }

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={styles.shell}>
      {/* Desktop sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoWrap}>
          <Logo />
        </div>
        <nav className={styles.nav}>
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(styles.navLink, isActive && styles.navLinkActive)
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.userCard}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user?.name}</p>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn} aria-label="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className={styles.mobileNav}>
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(styles.mobileLink, isActive && styles.mobileLinkActive)
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
