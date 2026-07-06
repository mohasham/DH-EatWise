import { NavLink, Outlet } from "react-router-dom"
import { LayoutDashboard, UtensilsCrossed, CalendarClock, User } from "lucide-react"
import { Logo } from "../logo/logo.components"
import { currentUser } from "../../lib/mock-data"
import { cn } from "../../lib/utils"
import "./app-layout.styles.css"

const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/meal-plan", label: "Meal Plan", icon: UtensilsCrossed },
    { to: "/history", label: "History", icon: CalendarClock },
    { to: "/profile", label: "Profile", icon: User },
]

export function AppLayout() {
    return (
        <div className="layoutContainer">
            {/* Desktop sidebar */}
            <aside className="desktopAside">
                <div className="logoWrapper">
                    <Logo />
                </div>
                <nav className="sidebarNav">
                    {nav.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                cn(
                                    "navLink",
                                    isActive ? "linkActive" : "linkPassive"
                                )
                            }
                        >
                            <Icon size={20} />
                            {label}
                        </NavLink>
                    ))}
                </nav>
                <div className="userProfileCard">
                    <div className="userAvatar">
                        {currentUser.initials}
                    </div>
                    <div className="userInfo">
                        <p className="userName">{currentUser.name}</p>
                        <p className="userEmail">{currentUser.email}</p>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="mainContent">
                <div className="contentInner">
                    <Outlet />
                </div>
            </main>

            {/* Mobile bottom nav */}
            <nav className="mobileBottomNav">
                {nav.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            cn(
                                "mobileNavLink",
                                isActive ? "mobileLinkActive" : "mobileLinkPassive"
                            )
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