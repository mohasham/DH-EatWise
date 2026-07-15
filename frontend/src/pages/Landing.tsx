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
import { Logo } from "../components/logo"
import { Button } from "../components/ui/button"
import { Card, Badge } from "../components/ui/primitives"
import { todaysMeals } from "../lib/mock-data"
import styles from "./Landing.module.css"

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

export default function Landing() {
  return (
    <div className={styles.page}>
      {/* Navbar */}
      <header className={styles.header}>
        <div className={styles.navInner}>
          <Logo />
          <div className={styles.navActions}>
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="accent" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div
          className={styles.heroBg}
          style={{
            background:
              "radial-gradient(60% 60% at 15% 10%, rgba(15,110,86,0.10) 0%, rgba(248,247,242,0) 60%), radial-gradient(50% 50% at 95% 30%, rgba(232,168,56,0.12) 0%, rgba(248,247,242,0) 55%)",
          }}
        />
        <div className={styles.heroGrid}>
          <div>
            <Badge tone="primary" className={styles.heroBadge}>
              <Sparkles size={13} /> AI-powered nutrition
            </Badge>
            <h1 className={styles.heroTitle}>
              Your Meal Plan, <span className={styles.heroHighlight}>Built Around You</span>
            </h1>
            <p className={styles.lead}>
              EatWise learns your health goals, dietary needs, and daily
              schedule to craft a personalized meal plan that actually fits
              your life.
            </p>
            <div className={styles.ctaRow}>
              <Link to="/register">
                <Button variant="accent" size="lg">Get Started Free</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">I have an account</Button>
              </Link>
            </div>
            <div className={styles.trust}>
              {["No credit card", "Personalized in minutes", "Health-first"].map((t) => (
                <span key={t} className={styles.trustItem}>
                  <Check size={15} className={styles.trustCheck} /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Mockup card */}
          <div className={styles.heroMedia}>
            <img
              src="/hero-meals.png"
              alt="Healthy meal prep bowls"
              className={styles.heroImg}
            />
            <Card className={styles.floatCard}>
              <p className={styles.floatLabel}>Today&apos;s target</p>
              <p className={styles.floatValue}>2,200 kcal</p>
              <div className={styles.floatTrack}>
                <div className={styles.floatBar} />
              </div>
              <p className={styles.floatNote}>1,815 kcal planned</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.h2}>Everything you need to eat well</h2>
          <p className={styles.sectionSub}>Smart features that adapt to your body and your day.</p>
        </div>
        <div className={styles.featureGrid}>
          {features.map(({ icon: Icon, title, text }) => (
            <Card key={title} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Icon size={24} />
              </div>
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureText}>{text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className={styles.howItWorks}>
        <div className={styles.howInner}>
          <div className={styles.sectionHead}>
            <h2 className={styles.h2}>How it works</h2>
            <p className={styles.sectionSub}>Three simple steps to your first plan.</p>
          </div>
          <div className={styles.stepGrid}>
            {steps.map(({ icon: Icon, title, text }, i) => (
              <Card key={title} className={styles.stepCard}>
                <span className={styles.stepNum}>{i + 1}</span>
                <div className={styles.stepIcon}>
                  <Icon size={26} />
                </div>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepText}>{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sample plan preview */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.h2}>A taste of your day</h2>
          <p className={styles.sectionSub}>Here&apos;s what a personalized EatWise day looks like.</p>
        </div>
        <div className={styles.mealGrid}>
          {todaysMeals.map((meal) => (
            <Card key={meal.id} className={styles.mealCard}>
              <img
                src={meal.image}
                alt={meal.name}
                className={styles.mealImg}
              />
              <div className={styles.mealBody}>
                <div className={styles.mealTop}>
                  <Badge tone="primary">{meal.type}</Badge>
                  <span className={styles.mealTime}>{meal.time}</span>
                </div>
                <h3 className={styles.mealName}>{meal.name}</h3>
                <p className={styles.mealCal}>
                  {meal.calories}{" "}
                  <span className={styles.mealCalUnit}>kcal</span>
                </p>
              </div>
            </Card>
          ))}
        </div>
        <div className={styles.ctaCenter}>
          <Link to="/register">
            <Button variant="accent" size="lg">Build my plan</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Logo />
          <nav className={styles.footerNav}>
            <a href="#" className={styles.footerLink}>Features</a>
            <a href="#" className={styles.footerLink}>How it works</a>
            <a href="#" className={styles.footerLink}>Privacy</a>
            <a href="#" className={styles.footerLink}>Contact</a>
          </nav>
          <p className={styles.copyright}>© 2026 EatWise</p>
        </div>
      </footer>
    </div>
  )
}
