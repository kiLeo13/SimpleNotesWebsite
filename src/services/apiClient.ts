import axios, { type InternalAxiosRequestConfig} from "axios"

const PATH_API_KEY: string = "id_token"

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
})

// ----------------------------------------------------------------
// Request Interceptor
// This runs BEFORE each request is sent
// ----------------------------------------------------------------
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(PATH_API_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// ----------------------------------------------------------------
// Response Interceptor
// This runs AFTER a response is received
// ----------------------------------------------------------------
apiClient.interceptors.response.use((response) => {
  return response
}, (error) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    console.log("Unauthorized request. Redirecting to login page...")
    localStorage.removeItem(PATH_API_KEY)
    window.location.href = '/login'
  }
  return Promise.reject(error)
})

export default apiClient