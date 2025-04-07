import { createContext, useState, useEffect, useContext } from "react"
import PropTypes from "prop-types"
import { loginUser, validateToken } from "../api/userApi"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Проверка токена при загрузке приложения
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = JSON.parse(localStorage.getItem("user"))

    if (token && userData) {
      const validateUser = async () => {
        try {
          const validatedUserData = await validateToken(token) // Проверяем токен на сервере
          setUser(validatedUserData) // Устанавливаем пользователя
        } catch (error) {
          console.error("Ошибка при проверке токена:", error)
          logout() // Если токен недействителен, разлогиниваем пользователя
        } finally {
          setLoading(false)
        }
      }

      validateUser()
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    const { token, user: userData } = await loginUser(credentials)
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext