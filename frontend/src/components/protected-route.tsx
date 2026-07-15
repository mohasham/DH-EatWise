import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../lib/auth-context"

/** Redirects to /login if the user is not authenticated. */
export function ProtectedRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

/** Redirects to /admin/dashboard if not admin. */
export function AdminRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />
  return <Outlet />
}
