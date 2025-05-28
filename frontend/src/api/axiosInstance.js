import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://hospital-backend-6ni9.onrender.com/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

api.interceptors.request.use(
  async (config) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error("Ошибка при получении токена:", error)
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Ошибка API:", error.response?.data || error.message)

    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      sessionStorage.removeItem("token")
      window.location.href = "/login"
    }

    return Promise.reject(error)
  }
)

export default api