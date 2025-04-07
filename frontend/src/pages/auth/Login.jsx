import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Input from "../../components/Input"
import Button from "../../components/Button"
import Loader from "../../components/Loader"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login, user, loading: authLoading } = useAuth() // Используем authLoading
  const navigate = useNavigate()

  // Если пользователь уже авторизован, перенаправляем на главную
  useEffect(() => {
    if (user) {
      navigate("/main")
    }
  }, [user, navigate])

  // Если идет проверка токена, показываем загрузку
  if (authLoading) {
    return <Loader size="8" color="blue" />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Пожалуйста, заполните все поля.")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Выполняем вход через API
      await login({ email, password })
      navigate("/main") // Перенаправляем на главную страницу
    } catch (error) {
      console.error("Ошибка при входе:", error)
      setError("Неверный email или пароль.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Вход в систему</h1>

        {/* Форма входа */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Поле для email */}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Введите ваш email"
            required
          />

          {/* Поле для пароля */}
          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите ваш пароль"
            required
          />

          {/* Сообщение об ошибке */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Кнопка входа */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader size="4" color="white" /> : "Войти"}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Login