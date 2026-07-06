import { Link } from "react-router-dom"
import { Logo } from "../logo/logo.components"
import "./auth-shell.styles.css"

export function AuthShell({
  children,
  quote,
}: {
  children: React.ReactNode
  quote: string
}) {
  return (
    <div className="shellContainer">
      {/* Left visual panel */}
      <div className="visualPanel">
        <img
          src="/auth-wellness.png"
          alt="Fresh healthy ingredients"
          className="bgImage"
        />
        <div className="overlay" />
        <div className="panelContent">
          <Link to="/">
            <Logo onDark />
          </Link>
          <blockquote className="quoteText">
            &ldquo;{quote}&rdquo;
          </blockquote>
        </div>
      </div>

      {/* Right form panel */}
      <div className="formPanel">
        <div className="formWrapper">
          <div className="mobileLogoWrapper">
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