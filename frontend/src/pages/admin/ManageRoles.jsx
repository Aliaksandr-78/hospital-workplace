import { useEffect, useState } from "react"
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../../api/roleApi"
import Button from "../../components/Button"
import Header from "../../components/Header"
import Loader from "../../components/Loader"
import Modal from "../../components/Modal"
import Input from "../../components/Input"

const ManageRoles = () => {

  const [roles, setRoles] = useState([]) // Состояние для списка ролей
  const [loading, setLoading] = useState(true) // Состояние для загрузки
  const [error, setError] = useState("") // Состояние для ошибок
  const [isModalOpen, setModalOpen] = useState(false) // Состояние для модального окна
  const [currentRole, setCurrentRole] = useState(null) // Состояние для текущей роли (редактирование/добавление)
  const [formData, setFormData] = useState({ RoleName: "" }) // Состояние для данных формы

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const data = await getAllRoles();
        setRoles(data)
      } catch (error) {
        console.error("Ошибка при загрузке ролей:", error)
        setError("Не удалось загрузить роли. Пожалуйста, попробуйте позже.")
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [])

  // Обработчик открытия модального окна для добавления/редактирования
  const openModal = (role = null) => {
    setCurrentRole(role)
    setFormData(role ? { RoleName: role.rolename } : { RoleName: "" })
    setModalOpen(true)
  }

  // Обработчик закрытия модального окна
  const closeModal = () => {
    setModalOpen(false);
    setCurrentRole(null);
    setFormData({ RoleName: "" })
  }

  // Обработчик изменения данных формы
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Обработчик отправки формы (добавление/редактирование)
  const handleSubmit = async (e) => {
    e.preventDefault()
  
    try {
      const roleData = { roleName: formData.RoleName }
      if (currentRole) {
        const updatedRole = await updateRole(currentRole.roleid, roleData)
        setRoles((prev) =>
          prev.map((role) =>
            role.roleid === updatedRole.roleid ? updatedRole : role
          )
        )
      } else {
        // Добавление новой роли
        const newRole = await createRole(roleData)
        setRoles((prev) => [...prev, newRole])
      }
      closeModal()
    } catch (error) {
      console.error("Ошибка при сохранении роли:", error)
      setError("Не удалось сохранить роль. Пожалуйста, попробуйте позже.")
    }
  }

  const handleDelete = async (roleID) => {
    try {
      await deleteRole(roleID)
      setRoles((prev) => prev.filter((role) => role.roleid !== roleID))
    } catch (error) {
      console.error("Ошибка при удалении роли:", error)
      setError("Не удалось удалить роль. Пожалуйста, попробуйте позже.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Шапка с кнопкой выхода */}
      <Header appName="Управление ролями" />

      {/* Основное содержимое */}
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Управление ролями
        </h1>

        {/* Индикатор загрузки */}
        {loading && <Loader className="flex justify-center my-8" />}

        {/* Сообщение об ошибке */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Кнопка добавления новой роли */}
        <div className="flex justify-end mb-4">
          <Button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700">
            Добавить роль
          </Button>
        </div>

        {/* Таблица ролей */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Название роли</th>
                <th className="py-2 px-4 border-b">Действия</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.roleid} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{role.roleid}</td>
                  <td className="py-2 px-4 border-b">{role.rolename}</td>
                  <td className="py-2 px-4 border-b">
                    <Button
                      onClick={() => openModal(role)}
                      className="mr-2 bg-blue-600 hover:bg-blue-700"
                    >
                      Редактировать
                    </Button>
                    <Button
                      onClick={() => handleDelete(role.roleid)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Модальное окно для добавления/редактирования роли */}
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentRole ? "Редактировать роль" : "Добавить роль"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Название роли"
                name="RoleName"
                value={formData.RoleName}
                onChange={handleInputChange}
                placeholder="Введите название роли"
                required
              />
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Отмена
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {currentRole ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default ManageRoles