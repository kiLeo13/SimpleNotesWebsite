import { hasSession } from '@/utils/authutils'
import { Navigate } from 'react-router-dom'

type ProtectedRouteProps = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!hasSession()) {
    return <Navigate to="/login" replace />
  }

  return children
}