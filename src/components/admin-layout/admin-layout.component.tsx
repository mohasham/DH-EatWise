import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { LayoutDashboard, Users, ScrollText, Menu, X } from "lucide-react"
import { Logo } from "../logo/logo.components"
import { cn } from "../../lib/utils"
import styles from "./admin-layout.styles.css"

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/rules", label: "Rules", icon: ScrollText },
]

export function AdminLayout() {
  const [open, setOpen] = useState(false)

  const SidebarContent = (
    <>
      <div className={styles.logoWrapper}>
        <Logo onDark />
      </div>
      <nav className={styles.navContainer}>
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                styles.navLink,
                isActive ? styles.linkActive : styles.linkPassive
              )
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )

  return (
    <div className={styles.layoutContainer}>
      {/* Desktop sidebar */}
      <aside className={styles.desktopAside}>
        {SidebarContent}
      </aside>

      {/* Mobile top bar */}
      <header className={styles.mobileHeader}>
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
        <div className={styles.mobileDrawer}>
          <div
            className={styles.drawerOverlay}
            onClick={() => setOpen(false)}
          />
          <aside className={styles.mobileAside}>
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

      <main className={styles.mainContent}>
        <div className={styles.contentInner}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}