import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { getAllSpecialties } from "../../api/specialtyApi"
import { getAllRoles } from "../../api/roleApi"
import { getUserRolesByUserId } from "../../api/userRoleApi"
import Button from "../../components/Button"
import Header from "../../components/Header"
import Loader from "../../components/Loader"

const Main = () => {
  const { user } = useAuth() // Получаем данные пользователя
  const navigate = useNavigate() // Для навигации

  const [specialties, setSpecialties] = useState([]) // Состояние для списка специальностей
  const [roles, setRoles] = useState([]); // Состояние для списка ролей
  const [userRoles, setUserRoles] = useState([]) // Состояние для ролей текущего пользователя
  const [loading, setLoading] = useState(true) // Состояние для загрузки
  const [error, setError] = useState("") // Состояние для ошибок

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Загружаем специальности и роли
        const [specialtiesData, rolesData] = await Promise.all([
          getAllSpecialties(), // Загружаем специальности
          getAllRoles(), // Загружаем роли
        ])

        setSpecialties(specialtiesData)
        setRoles(rolesData)

        // Загружаем роли текущего пользователя
        if (user?.userid) {
          const userRolesData = await getUserRolesByUserId(user.userid)
          setUserRoles(userRolesData)
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error)
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.userid]) // Зависимость от userid

  // Получение названия специальности по ID
  const getSpecialtyName = (specialtyID) => {
    const specialty = specialties.find((spec) => spec.specialtyid === specialtyID)
    return specialty ? specialty.specialtyname : "Не указано"
  }

  // Получение названий ролей пользователя
  const getUserRoleNames = () => {
    return userRoles
      .map((userRole) => {
        const role = roles.find((role) => role.roleid === userRole.roleid); // Используем roleid из UserRoles
        return role ? role.rolename : "Неизвестная роль";
      })
      .join(", ");
  }

  // Функция для навигации в зависимости от роли
  const navigateToDashboard = () => {
    const userRoleNames = getUserRoleNames();
    if (userRoleNames.includes("Admin")) {
      navigate("/admindashboard") // Администратор
    } else {
      navigate("/dashboard") // По умолчанию
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Шапка с кнопкой выхода */}
      <Header appName="Медицинская система" />

      {/* Основное содержимое */}
      <div className="container mx-auto p-3 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
          Добро пожаловать, {user?.firstname} {user?.middlename} {user?.lastname}!
        </h1>

        {/* Индикатор загрузки */}
        {loading && <Loader className="flex justify-center my-6 sm:my-8" />}

        {/* Сообщение об ошибке */}
        {error && <p className="text-red-500 text-center mb-3 sm:mb-4">{error}</p>}

        {/* Информация о пользователе */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Ваш профиль</h2>
          <p className="text-sm sm:text-base">
            <strong>Email:</strong> {user?.email}
          </p>
          <p className="text-sm sm:text-base">
            <strong>Роли:</strong> {getUserRoleNames()}
          </p>
          <p className="text-sm sm:text-base">
            <strong>Специальность:</strong> {getSpecialtyName(user?.specialtyid)}
          </p>
        </div>

        {/* Быстрые действия */}
        <div className="flex justify-center">
          <Button
            onClick={navigateToDashboard}
            className="w-full md:w-auto px-3 py-2 sm:px-4 sm:py-3 md:p-4 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
          >
            Перейти в Dashboard
          </Button>
        </div>

        {/* Дополнительная информация в зависимости от роли */}
        {getUserRoleNames().includes("Admin") && (
          <div className="mt-4 sm:mt-6 bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Администратор</h2>
            <p className="text-sm sm:text-base">
              У вас есть доступ к управлению пользователями, ролями и другими
              системными настройками.
            </p>
          </div>
        )}

        {getUserRoleNames().includes("Врач") && (
          <div className="mt-4 sm:mt-6 bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Врач</h2>
            <p className="text-sm sm:text-base">
              Вы можете управлять приемами, назначать лечение и просматривать
              медицинские карты пациентов.
            </p>
          </div>
        )}

        {getUserRoleNames().includes("Медсестра") && (
          <div className="mt-4 sm:mt-6 bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Медсестра</h2>
            <p className="text-sm sm:text-base">
              Вы можете управлять расписанием, записывать пациентов на прием и
              помогать врачам.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Main