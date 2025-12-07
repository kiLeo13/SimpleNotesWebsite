import { Route, Routes } from "react-router-dom"
import { Toaster } from "sonner"
import { MainPage } from "./pages/mainpage/MainPage"
import { LoginPage } from "./pages/auth/LoginPage"
import { SignupPage } from "./pages/auth/SignupPage"

import { ProtectedRoute } from "./pages/mainpage/ProtectedRoute"

import "./services/i18n" // Init translations
import "./App.css"

export const APP_NAME: string = "Onnyx"

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        expand={true}
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