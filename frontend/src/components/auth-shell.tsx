import { Link } from "react-router-dom"
import { Logo } from "../components/logo"
import styles from "./auth-shell.module.css"

export function AuthShell({
  children,
  quote,
}: {
  children: React.ReactNode
  quote: string
}) {
  return (
    <div className={styles.shell}>
      {/* Left visual panel */}
      <div className={styles.visual}>
        <img
          src="/auth-wellness.png"
          alt="Fresh healthy ingredients"
          className={styles.image}
        />
        <div className={styles.overlay} />
        <div className={styles.visualContent}>
          <Link to="/">
            <Logo onDark />
          </Link>
          <blockquote className={styles.quote}>
            &ldquo;{quote}&rdquo;
          </blockquote>
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.formPanel}>
        <div className={styles.formInner}>
          <div className={styles.mobileLogo}>
            <Link to="/">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
