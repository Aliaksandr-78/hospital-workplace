import { useEffect, useState } from "react"
import {
  getAllSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
} from "../../api/specialtyApi"
import Button from "../../components/Button"
import Header from "../../components/Header"
import Loader from "../../components/Loader"
import Modal from "../../components/Modal"
import Input from "../../components/Input"

const ManageSpecialties = () => {

  const [specialties, setSpecialties] = useState([]) // Состояние для списка специальностей
  const [loading, setLoading] = useState(true) // Состояние для загрузки
  const [error, setError] = useState("") // Состояние для ошибок
  const [isModalOpen, setModalOpen] = useState(false) // Состояние для модального окна
  const [currentSpecialty, setCurrentSpecialty] = useState(null) // Состояние для текущей специальности (редактирование/добавление)
  const [formData, setFormData] = useState({ SpecialtyName: "", Description: "" }) // Состояние для данных формы

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoading(true)
        const data = await getAllSpecialties()
        setSpecialties(data)
      } catch (error) {
        console.error("Ошибка при загрузке специальностей:", error)
        setError("Не удалось загрузить специальности. Пожалуйста, попробуйте позже.")
      } finally {
        setLoading(false)
      }
    }

    fetchSpecialties()
  }, [])

  // Обработчик открытия модального окна для добавления/редактирования
  const openModal = (specialty = null) => {
    setCurrentSpecialty(specialty)
    setFormData(
      specialty
        ? { SpecialtyName: specialty.specialtyname, Description: specialty.description }
        : { SpecialtyName: "", Description: "" }
    );
    setModalOpen(true)
  }

  // Обработчик закрытия модального окна
  const closeModal = () => {
    setModalOpen(false)
    setCurrentSpecialty(null)
    setFormData({ SpecialtyName: "", Description: "" })
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
      const specialtyData = {
        specialtyName: formData.SpecialtyName,
        description: formData.Description
      }
      if (currentSpecialty) {
        // Редактирование специальности
        const updatedSpecialty = await updateSpecialty(currentSpecialty.specialtyid, specialtyData)
        setSpecialties((prev) =>
          prev.map((specialty) =>
            specialty.specialtyid === updatedSpecialty.specialtyid ? updatedSpecialty : specialty
          )
        )
      } else {
        // Добавление новой специальности
        const newSpecialty = await createSpecialty(specialtyData)
        setSpecialties((prev) => [...prev, newSpecialty])
      }
      closeModal()
    } catch (error) {
      console.error("Ошибка при сохранении специальности:", error)
      setError("Не удалось сохранить специальность. Пожалуйста, попробуйте позже.")
    }
  }

  // Обработчик удаления специальности
  const handleDelete = async (specialtyID) => {
    try {
      await deleteSpecialty(specialtyID);
      setSpecialties((prev) => prev.filter((specialty) => specialty.specialtyid !== specialtyID));
    } catch (error) {
      console.error("Ошибка при удалении специальности:", error);
      setError("Не удалось удалить специальность. Пожалуйста, попробуйте позже.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Шапка с кнопкой выхода */}
      <Header appName="Управление медицинскими специальностями" />

      {/* Основное содержимое */}
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Управление медицинскими специальностями
        </h1>

        {/* Индикатор загрузки */}
        {loading && <Loader className="flex justify-center my-8" />}

        {/* Сообщение об ошибке */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Кнопка добавления новой специальности */}
        <div className="flex justify-end mb-4">
          <Button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700">
            Добавить специальность
          </Button>
        </div>

        {/* Таблица специальностей */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Название</th>
                <th className="py-2 px-4 border-b">Описание</th>
                <th className="py-2 px-4 border-b">Действия</th>
              </tr>
            </thead>
            <tbody>
              {specialties.map((specialty) => (
                <tr key={specialty.SpecialtyID} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{specialty.specialtyid}</td>
                  <td className="py-2 px-4 border-b">{specialty.specialtyname}</td>
                  <td className="py-2 px-4 border-b">{specialty.description}</td>
                  <td className="py-2 px-4 border-b">
                    <Button
                      onClick={() => openModal(specialty)}
                      className="mr-2 bg-blue-600 hover:bg-blue-700"
                    >
                      Редактировать
                    </Button>
                    <Button
                      onClick={() => handleDelete(specialty.specialtyid)}
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

        {/* Модальное окно для добавления/редактирования специальности */}
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentSpecialty ? "Редактировать специальность" : "Добавить специальность"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Название"
                name="SpecialtyName"
                value={formData.SpecialtyName}
                onChange={handleInputChange}
                placeholder="Введите название специальности"
                required
              />
              <Input
                label="Описание"
                name="Description"
                type="textarea"
                value={formData.Description}
                onChange={handleInputChange}
                placeholder="Введите описание"
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
                  {currentSpecialty ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default ManageSpecialties