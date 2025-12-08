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
        visibleToasts={6}
        expand={true}
        toastOptions={
          {
            duration: 5000,
            style: {
              backgroundColor: "rgb(33, 29, 43)",
              borderColor: "rgba(60, 55, 77, 1)",
              color: "#dd7a7aff"
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