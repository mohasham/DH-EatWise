import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthShell } from "../../../components/auth-shell/auth-shell.component"
import { Button } from "../../../components/button/button.component"
import { Input } from "../../../components/primitives/primitives.component"
import "./login.styles.css"

export const Login = () => {
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
        <h1 className="login-header-title">Welcome back</h1>
        <p className="login-subtitle">
          Log in to continue your meal plan.
        </p>

        <form onSubmit={handleSubmit} className="login-form-container">
          <Input id="email" label="Email address" type="email" required />
          <Input id="password" label="Password" type="password" required />

          <div className="login-utilities-row">
            <a href="#" className="forgot-password-link">
              Forgot password?
            </a>
          </div>

          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Signing in..." : "Log in"}
          </Button>
        </form>

        <p className="login-footer-redirect">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="login-redirect-link">
            Create one
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}