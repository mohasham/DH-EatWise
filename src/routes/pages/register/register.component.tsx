import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthShell } from "../../../components/auth-shell/auth-shell.component"
import { Button } from "../../../components/button/button.component"
import { Input } from "../../../components/primitives/primitives.component"
import "./register.styles.css"

export const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  })

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError("Passwords do not match.")
      return
    }
    setError("")
    loadingState(true)
    setTimeout(() => navigate("/setup"), 600)
  }

  return (
    <AuthShell quote="Your journey to better eating starts with a single plan.">
      <div>
        <h1 className="register-header-title">Create your account</h1>
        <p className="register-subtitle">
          Join EatWise and get your personalized plan.
        </p>

        <form onSubmit={handleSubmit} className="register-form-container">
          <Input id="name" label="Full name" value={form.name} onChange={set("name")} required />
          <Input id="email" label="Email address" type="email" value={form.email} onChange={set("email")} required />
          <Input id="password" label="Password" type="password" value={form.password} onChange={set("password")} required />
          <Input id="confirm" label="Confirm password" type="password" value={form.confirm} onChange={set("confirm")} required />

          {error && (
            <p className="register-error-banner">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="register-footer-redirect">
          Already have an account?{" "}
          <Link to="/login" className="register-redirect-link">
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}