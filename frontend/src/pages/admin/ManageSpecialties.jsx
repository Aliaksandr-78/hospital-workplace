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
  const [specialties, setSpecialties] = useState([])
  const [filteredSpecialties, setFilteredSpecialties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isModalOpen, setModalOpen] = useState(false)
  const [currentSpecialty, setCurrentSpecialty] = useState(null)
  const [formData, setFormData] = useState({ SpecialtyName: "", Description: "" })
  const [searchTerm, setSearchTerm] = useState("") // Состояние для поискового запроса

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoading(true)
        const data = await getAllSpecialties()
        setSpecialties(data)
        setFilteredSpecialties(data) // Инициализируем отфильтрованный список
      } catch (error) {
        console.error("Ошибка при загрузке специальностей:", error)
        setError("Не удалось загрузить специальности. Пожалуйста, попробуйте позже.")
      } finally {
        setLoading(false)
      }
    }

    fetchSpecialties()
  }, [])

  // Фильтрация специальностей при изменении поискового запроса
  useEffect(() => {
    if (searchTerm) {
      const filtered = specialties.filter(specialty =>
        specialty.specialtyname.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredSpecialties(filtered)
    } else {
      setFilteredSpecialties(specialties)
    }
  }, [searchTerm, specialties])

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Обработчик открытия модального окна для добавления/редактирования
  const openModal = (specialty = null) => {
    setCurrentSpecialty(specialty)
    setFormData(
      specialty
        ? { SpecialtyName: specialty.specialtyname, Description: specialty.description }
        : { SpecialtyName: "", Description: "" }
    )
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
      await deleteSpecialty(specialtyID)
      setSpecialties((prev) => prev.filter((specialty) => specialty.specialtyid !== specialtyID))
    } catch (error) {
      console.error("Ошибка при удалении специальности:", error)
      setError("Не удалось удалить специальность. Пожалуйста, попробуйте позже.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Управление медицинскими специальностями" />
      <div className="container mx-auto p-3 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
          Управление медицинскими специальностями
        </h1>

        {loading && <Loader className="flex justify-center my-6 sm:my-8" />}
        {error && <p className="text-red-500 text-center mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>}

        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
          <Input
            type="text"
            placeholder="Поиск по названию специальности..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full sm:w-64"
          />
          <Button 
            onClick={() => openModal()} 
            className="bg-green-600 hover:bg-green-700 text-sm sm:text-base"
          >
            Добавить специальность
          </Button>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">ID</th>
                  <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Название</th>
                  <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Описание</th>
                  <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredSpecialties.length > 0 ? (
                  filteredSpecialties.map((specialty) => (
                    <tr key={specialty.specialtyid} className="hover:bg-gray-50">
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{specialty.specialtyid}</td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{specialty.specialtyname}</td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{specialty.description}</td>
                      <td className="py-2 px-2 sm:px-4 border-b">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <Button
                            onClick={() => openModal(specialty)}
                            className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                          >
                            Редактировать
                          </Button>
                          <Button
                            onClick={() => handleDelete(specialty.specialtyid)}
                            className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                          >
                            Удалить
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-xs sm:text-sm">
                      {specialties.length === 0 ? "Нет данных о специальностях" : "Ничего не найдено"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              {currentSpecialty ? "Редактировать специальность" : "Добавить специальность"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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
              <div className="flex justify-end gap-3 sm:gap-4">
                <Button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-600 hover:bg-gray-700 text-sm sm:text-base"
                >
                  Отмена
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-sm sm:text-base">
                  {currentSpecialty ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default ManageSpecialties