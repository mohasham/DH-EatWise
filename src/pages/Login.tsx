import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthShell } from "@/components/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/primitives"
import styles from "./Login.module.css"

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => navigate("/dashboard"), 600)
  }

  return (
    <AuthShell quote="Small, consistent choices are what build a healthier you.">
      <div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Log in to continue your meal plan.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input id="email" label="Email address" type="email" required />
          <Input id="password" label="Password" type="password" required />

          <div className={styles.forgotRow}>
            <a href="#" className={styles.forgotLink}>
              Forgot password?
            </a>
          </div>

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
