import { Link } from "react-router-dom"
import {
  Sparkles,
  Clock,
  HeartPulse,
  LineChart,
  UserPlus,
  Wand2,
  CheckCircle2,
  Check,
} from "lucide-react"
import { Logo } from "../../../components/logo/logo.components"
import { Card, Badge } from "../../../components/primitives/primitives.component"
import { todaysMeals } from "../../../lib/mock-data"
import "./landing.styles.css"

const features = [
  {
    icon: Sparkles,
    title: "Personalized Plans",
    text: "AI builds every meal around your body, goals, and taste — no generic diets.",
  },
  {
    icon: Clock,
    title: "Schedule-Based Timing",
    text: "Meals scheduled around your work, study, sleep, and wake hours.",
  },
  {
    icon: HeartPulse,
    title: "Health-Aware Meals",
    text: "Respects your conditions, allergies, and dietary preferences automatically.",
  },
  {
    icon: LineChart,
    title: "Daily Tracking",
    text: "Mark meals as eaten and watch your consistency grow day over day.",
  },
]

const steps = [
  { icon: UserPlus, title: "Fill Your Profile", text: "Tell us your goals, health details, and daily schedule." },
  { icon: Wand2, title: "Get Your Plan", text: "Our AI generates a balanced, personalized meal plan instantly." },
  { icon: CheckCircle2, title: "Track Your Meals", text: "Follow your plan, check off meals, and stay on target." },
]

export const Landing = () => {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <header className="landing-navbar">
        <div className="max-width-container navbar-inner">
          <Logo />
          <div className="navbar-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-accent btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-section">
        <div
          className="absolute-fill-background"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: -10,
            background:
              "radial-gradient(60% 60% at 15% 10%, rgba(15,110,86,0.10) 0%, rgba(248,247,242,0) 60%), radial-gradient(50% 50% at 95% 30%, rgba(232,168,56,0.12) 0%, rgba(248,247,242,0) 55%)",
          }}
        />
        <div className="max-width-container hero-grid">
          <div>
            <div style={{ marginBottom: "1.25rem" }}>
              <Badge tone="primary">
                <Sparkles size={13} style={{ marginRight: "4px" }} /> AI-powered nutrition
              </Badge>
            </div>
            <h1 className="hero-title">
              Your Meal Plan, <span className="hero-title-highlight">Built Around You</span>
            </h1>
            <p className="hero-description">
              EatWise learns your health goals, dietary needs, and daily
              schedule to craft a personalized meal plan that actually fits
              your life.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-accent btn-lg">
                Get Started Free
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                I have an account
              </Link>
            </div>
            <div className="hero-bullets-row">
              {["No credit card", "Personalized in minutes", "Health-first"].map((t) => (
                <span key={t} className="hero-bullet-item">
                  <Check size={15} style={{ color: "var(--success)" }} /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Mockup card */}
          <div className="mockup-media-wrapper">
            <img
              src="/hero-meals.png"
              alt="Healthy meal prep bowls"
              className="mockup-hero-img"
            />
            <Card className="mockup-floating-card">
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground)" }}>Today&apos;s target</p>
              <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>2,200 kcal</p>
              <div className="progress-track-bg">
                <div className="progress-fill-accent" />
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.5rem" }}>1,815 kcal planned</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-width-container" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
        <div className="text-center-wrapper">
          <h2 className="section-main-heading">
            Everything you need to eat well
          </h2>
          <p className="section-tag-subtext">
            Smart features that adapt to your body and your day.
          </p>
        </div>
        <div className="features-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="p-6">
              <div className="feature-box-icon">
                <Icon size={24} />
              </div>
              <h3 className="feature-card-title">{title}</h3>
              <p className="feature-card-desc">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="workflow-section">
        <div className="max-width-container">
          <div className="text-center-wrapper">
            <h2 className="section-main-heading">
              How it works
            </h2>
            <p className="section-tag-subtext">Three simple steps to your first plan.</p>
          </div>
          <div className="workflow-grid">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <Card key={title} className="p-6" style={{ position: "relative", textAlign: "center" }}>
                <span className="workflow-badge-index">
                  {i + 1}
                </span>
                <div className="workflow-icon-box">
                  <Icon size={26} />
                </div>
                <h3 className="feature-card-title">{title}</h3>
                <p className="feature-card-desc">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sample plan preview */}
      <section className="max-width-container" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
        <div className="text-center-wrapper">
          <h2 className="section-main-heading">
            A taste of your day
          </h2>
          <p className="section-tag-subtext">
            Here&apos;s what a personalized EatWise day looks like.
          </p>
        </div>
        <div className="preview-section-grid">
          {todaysMeals.map((meal) => (
            <Card key={meal.id} style={{ overflow: "hidden" }}>
              <img
                src={meal.image}
                alt={meal.name}
                className="preview-img"
              />
              <div className="preview-body-container">
                <div className="preview-meta-row">
                  <Badge tone="primary">{meal.type}</Badge>
                  <span className="preview-time-info">{meal.time}</span>
                </div>
                <h3 className="preview-title-heading">{meal.name}</h3>
                <p className="preview-kcal-value">
                  {meal.calories}{" "}
                  <span className="preview-kcal-unit">kcal</span>
                </p>
              </div>
            </Card>
          ))}
        </div>
        <div className="preview-footer-action">
          <Link to="/register" className="btn btn-accent btn-lg">
            Build my plan
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="max-width-container footer-inner-content">
          <Logo />
          <nav className="footer-navbar">
            <a href="#">Features</a>
            <a href="#">How it works</a>
            <a href="#">Privacy</a>
            <a href="#">Contact</a>
          </nav>
          <p className="footer-copy-info">© 2026 EatWise</p>
        </div>
      </footer>
    </div>
  )
}