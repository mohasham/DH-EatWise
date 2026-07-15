import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthShell } from "../components/auth-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/primitives"
import { useAuth } from "../lib/auth-context"
import styles from "./Register.module.css"

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setError("")
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.confirmPassword)
      navigate("/setup")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell quote="Your journey to better eating starts with a single plan.">
      <div>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Join EatWise and get your personalized plan.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input id="name" label="Full name" value={form.name} onChange={set("name")} required />
          <Input id="email" label="Email address" type="email" value={form.email} onChange={set("email")} required />
          <Input id="password" label="Password" type="password" value={form.password} onChange={set("password")} required />
          <Input id="confirmPassword" label="Confirm password" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} required />

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" className={styles.footerLink}>
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
