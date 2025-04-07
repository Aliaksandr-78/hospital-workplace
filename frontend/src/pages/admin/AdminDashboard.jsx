import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAllUsers } from "../../api/userApi"
import { getAllServices } from "../../api/serviceApi"
import { getAllPatients } from "../../api/patientApi"
import Header from "../../components/Header"
import Button from "../../components/Button"
import Loader from "../../components/Loader"

const AdminDashboard = () => {
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [services, setServices] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [usersData, servicesData, patientsData] = await Promise.all([
          getAllUsers().catch((error) => {
            console.error("Ошибка при загрузке пользователей:", error)
            return []
          }),
          getAllServices().catch((error) => {
            console.error("Ошибка при загрузке услуг:", error)
            return []
          }),
          getAllPatients().catch((error) => {
            console.error("Ошибка при загрузке пациентов:", error)
            return []
          }),
        ])

        setUsers(usersData)
        setServices(servicesData)
        setPatients(patientsData)
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error)
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Панель администратора" />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Панель администратора</h1>

        {loading && <Loader className="flex justify-center my-8" />}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Карточки с данными */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Карточка с количеством пользователей */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Пользователи</h2>
            <p className="text-3xl font-bold">{users.length}</p>
            <Button
              onClick={() => navigate("/manage-users")}
              color="primary"
              className="mt-4"
            >
              Перейти к пользователям
            </Button>
          </div>

          {/* Карточка с количеством пациентов */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Пациенты</h2>
            <p className="text-3xl font-bold">{patients.length}</p>
            <Button
              onClick={() => navigate("/patients")}
              color="primary"
              className="mt-4"
            >
              Перейти к пациентам
            </Button>
          </div>

          {/* Карточка с количеством услуг */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Услуги</h2>
            <p className="text-3xl font-bold">{services.length}</p>
            <Button
              onClick={() => navigate("/manage-services")}
              color="primary"
              className="mt-4"
            >
              Перейти к услугам
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard