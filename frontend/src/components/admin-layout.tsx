import { useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { LayoutDashboard, Users, ScrollText, Menu, X, LogOut, ExternalLink } from "lucide-react"
import { Logo } from "../components/logo"
import { useAuth } from "../lib/auth-context"
import { cn } from "../lib/utils"
import styles from "./admin-layout.module.css"

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/rules", label: "Rules", icon: ScrollText },
]

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate("/login")
  }

  function handleViewSite() {
    navigate("/")
    setOpen(false)
  }

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const SidebarContent = (
    <div className={styles.sidebarBody}>
      <div className={styles.logoWrap}>
        <Logo onDark />
      </div>

      {/* Nav links */}
      <nav className={styles.nav}>
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(styles.navLink, isActive && styles.navLinkActive)
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}

        {/* View Site button — same style as nav links */}
        <button
          onClick={handleViewSite}
          className={cn(styles.navLink, styles.viewSiteBtn)}
        >
          <ExternalLink size={20} />
          View Site
        </button>
      </nav>

      {/* User card — same pattern as AppLayout */}
      <div className={styles.userCard}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{user?.name}</p>
          <p className={styles.userEmail}>{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className={styles.logoutBtn}
          aria-label="Log out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  )

  return (
    <div className={styles.shell}>
      {/* Desktop sidebar */}
      <aside className={styles.sidebar}>{SidebarContent}</aside>

      {/* Mobile top bar */}
      <header className={styles.topbar}>
        <button
          onClick={() => setOpen(true)}
          className={styles.menuBtn}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <Logo onDark />
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className={styles.drawer}>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <aside className={styles.drawerPanel}>
            <button
              onClick={() => setOpen(false)}
              className={styles.closeBtn}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <main className={styles.main}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}