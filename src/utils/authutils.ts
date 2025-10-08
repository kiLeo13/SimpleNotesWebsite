import { jwtDecode } from "jwt-decode"

export function hasSession(): boolean {
  const accessToken = localStorage.getItem('access_token')
  const idToken = localStorage.getItem('id_token')

  return isTokenValid(accessToken) && isTokenValid(idToken)
}

export function getTokenRemainingSeconds(jwt: string): number {
  try {
    const { exp } = jwtDecode(jwt)

    if (typeof exp === 'undefined') {
      console.warn('Got a token that does not have an expiration time')
      return 0
    }

    const currentTime = Math.floor(Date.now() / 1000)
    const remainingTime = exp - currentTime

    return remainingTime > 0 ? remainingTime : 0
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return 0
  }
}

function isTokenValid(jwt: string | null): boolean {
  if (!jwt || jwt.trim() === '') return false
  const now = Date.now()

  try {
    const { exp } = jwtDecode(jwt)
  
    return !!exp && now < exp * 1000
  } catch (err) {
    console.error('Failed to check if JWT token is valid:', err)
    return false
  }
}