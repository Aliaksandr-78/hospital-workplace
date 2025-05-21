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
      <Header appName="Управление ролями" />
      <div className="container mx-auto p-3 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
          Управление ролями
        </h1>

        {loading && <Loader className="flex justify-center my-6 sm:my-8" />}
        {error && <p className="text-red-500 text-center mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>}

        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => openModal()} 
            className="bg-green-600 hover:bg-green-700 text-sm sm:text-base"
          >
            Добавить роль
          </Button>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">ID</th>
                  <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Название роли</th>
                  <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Действия</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.roleid} className="hover:bg-gray-50">
                    <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{role.roleid}</td>
                    <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{role.rolename}</td>
                    <td className="py-2 px-2 sm:px-4 border-b">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <Button
                          onClick={() => openModal(role)}
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          Редактировать
                        </Button>
                        <Button
                          onClick={() => handleDelete(role.roleid)}
                          className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                        >
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              {currentRole ? "Редактировать роль" : "Добавить роль"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <Input
                label="Название роли"
                name="RoleName"
                value={formData.RoleName}
                onChange={handleInputChange}
                placeholder="Введите название роли"
                required
              />
              <div className="flex justify-end gap-3 sm:gap-4">
                <Button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-600 hover:bg-gray-700 text-sm sm:text-base"
                >
                  Отмена
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-sm sm:text-base">
                  {currentRole ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default ManageRoles