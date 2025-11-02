import { Route, Routes } from "react-router-dom"
import { MainPage } from "./pages/mainpage/MainPage"
import { LoginPage } from "./pages/auth/LoginPage"
import { SignupPage } from './pages/auth/SignupPage'
import { useState } from 'react'

import './App.css'
import { ProtectedRoute } from "./pages/mainpage/ProtectedRoute"

export const APP_NAME: string = "OnnyC"

function App() {
  const [admin, /*setAdmin*/] = useState(false)

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<SignupPage />} />

      {/* Protected Routes */}
      <Route
        index
        element={
          <ProtectedRoute>
            <MainPage isAdmin={admin} />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App