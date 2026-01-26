import { Route, Routes } from "react-router-dom"
import { Toaster } from "sonner"
import { MainPage } from "./pages/mainpage/MainPage"
import { LoginPage } from "./pages/auth/LoginPage"
import { SignupPage } from "./pages/auth/SignupPage"
import { ProtectedRoute } from "./pages/mainpage/ProtectedRoute"

import "./services/i18n" // Init translations
import "./App.css"

// Init code style
import 'highlight.js/styles/github-dark.css'

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        visibleToasts={6}
        expand={true}
        toastOptions={
          {
            duration: 5000,
            style: {
              backgroundColor: "rgb(33, 29, 43)",
              borderColor: "rgba(60, 55, 77, 1)"
            }
          }
        }
      />

      <Routes>
        {/* Public Routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<SignupPage />} />

        {/* Protected Routes */}
        <Route
          index
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App