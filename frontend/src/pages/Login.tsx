import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthShell } from "../components/auth-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/primitives"
import { useAuth } from "../lib/auth-context"
import styles from "./Login.module.css"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ email: "", password: "" })

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role === "admin") {
        navigate("/admin/dashboard")
      } else {
        navigate("/dashboard")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell quote="Small, consistent choices are what build a healthier you.">
      <div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Log in to continue your meal plan.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            id="email"
            label="Email address"
            type="email"
            value={form.email}
            onChange={set("email")}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={set("password")}
            required
          />

          <div className={styles.forgotRow}>
            <a href="#" className={styles.forgotLink}>
              Forgot password?
            </a>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Signing in..." : "Log in"}
          </Button>
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link to="/register" className={styles.footerLink}>
            Create one
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}