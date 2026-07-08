import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { LayoutDashboard, Users, ScrollText, Menu, X } from "lucide-react"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"
import styles from "./admin-layout.module.css"

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/rules", label: "Rules", icon: ScrollText },
]

export function AdminLayout() {
  const [open, setOpen] = useState(false)

  const SidebarContent = (
    <div className={styles.sidebarBody}>
      <div className={styles.logoWrap}>
        <Logo onDark />
      </div>
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
      </nav>
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
