import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Analytics } from "@vercel/analytics/react"
import AppRoutes from "./routes/app-routes"
import { AuthProvider } from "./lib/auth-context"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>,
)
