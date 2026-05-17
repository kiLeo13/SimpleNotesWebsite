import { StrictMode } from "react"
import { RouterProvider } from "@tanstack/react-router"
import { createRoot } from "react-dom/client"
import { router } from "./router"

import "./services/i18n"
import "./themes.css"
import "./index.css"

// Side-effect: initializes theme from localStorage before first paint
import "./stores/useThemeStore"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
