import { Routes, Route } from "react-router-dom"
import Landing from "@/pages/Landing"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import Setup from "@/pages/Setup"
import Dashboard from "@/pages/Dashboard"
import MealPlan from "@/pages/MealPlan"
import History from "@/pages/History"
import Profile from "@/pages/Profile"
import AdminDashboard from "@/pages/admin/AdminDashboard"
import AdminUsers from "@/pages/admin/AdminUsers"
import AdminRules from "@/pages/admin/AdminRules"
import { AppLayout } from "@/components/app-layout"
import { AdminLayout } from "@/components/admin-layout"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/setup" element={<Setup />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meal-plan" element={<MealPlan />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/rules" element={<AdminRules />} />
      </Route>
    </Routes>
  )
}
