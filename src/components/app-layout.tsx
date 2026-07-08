import { NavLink, Outlet } from "react-router-dom"
import { LayoutDashboard, UtensilsCrossed, CalendarClock, User } from "lucide-react"
import { Logo } from "@/components/logo"
import { currentUser } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import styles from "./app-layout.module.css"

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/meal-plan", label: "Meal Plan", icon: UtensilsCrossed },
  { to: "/history", label: "History", icon: CalendarClock },
  { to: "/profile", label: "Profile", icon: User },
]

export function AppLayout() {
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
          <div className={styles.avatar}>{currentUser.initials}</div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{currentUser.name}</p>
            <p className={styles.userEmail}>{currentUser.email}</p>
          </div>
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
