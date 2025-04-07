import { useEffect, useState } from "react"
import {
  getAllMedications,
  createMedication,
  updateMedication,
  deleteMedication,
} from "../../api/medicationApi"
import Button from "../../components/Button"
import Header from "../../components/Header"
import Loader from "../../components/Loader"
import Modal from "../../components/Modal"
import Input from "../../components/Input"

const ManageMedications = () => {

  const [medications, setMedications] = useState([]) // Состояние для списка лекарств
  const [loading, setLoading] = useState(true) // Состояние для загрузки
  const [error, setError] = useState("") // Состояние для ошибок
  const [isModalOpen, setModalOpen] = useState(false) // Состояние для модального окна
  const [currentMedication, setCurrentMedication] = useState(null) // Состояние для текущего лекарства (редактирование/добавление)
  const [formData, setFormData] = useState({ Name: "", Description: "", DosageRecommendations: "" }) // Состояние для данных формы

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true)
        const data = await getAllMedications()
        setMedications(data)
      } catch (error) {
        console.error("Ошибка при загрузке лекарств:", error)
        setError("Не удалось загрузить лекарства. Пожалуйста, попробуйте позже.")
      } finally {
        setLoading(false)
      }
    }

    fetchMedications()
  }, [])

  // Обработчик открытия модального окна для добавления/редактирования
  const openModal = (medication = null) => {
    setCurrentMedication(medication)
    setFormData(
      medication
        ? { Name: medication.name, Description: medication.description, DosageRecommendations: medication.dosagerecommendations }
        : { Name: "", Description: "", DosageRecommendations: "" }
    )
    setModalOpen(true)
  }

  // Обработчик закрытия модального окна
  const closeModal = () => {
    setModalOpen(false)
    setCurrentMedication(null)
    setFormData({ Name: "", Description: "", DosageRecommendations: "" })
  }

  // Обработчик изменения данных формы
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Обработчик отправки формы (добавление/редактирование)
  const handleSubmit = async (e) => {
    e.preventDefault()
    const madicationData = {
      name: formData.Name,
      description: formData.Description,
      dosageRecommendations: formData.DosageRecommendations
    }
    try {
      if (currentMedication) {
        // Редактирование лекарства
        const updatedMedication = await updateMedication(currentMedication.medicationid, madicationData)
        setMedications((prev) =>
          prev.map((medication) =>
            medication.medicationid === updatedMedication.medicationid ? updatedMedication : medication
          )
        )
      } else {
        // Добавление нового лекарства
        const newMedication = await createMedication(madicationData)
        setMedications((prev) => [...prev, newMedication])
      }
      closeModal()
    } catch (error) {
      console.error("Ошибка при сохранении лекарства:", error)
      setError("Не удалось сохранить лекарство. Пожалуйста, попробуйте позже.")
    }
  }

  // Обработчик удаления лекарства
  const handleDelete = async (medicationID) => {
    try {
      await deleteMedication(medicationID)
      setMedications((prev) => prev.filter((medication) => medication.medicationid !== medicationID))
    } catch (error) {
      console.error("Ошибка при удалении лекарства:", error)
      setError("Не удалось удалить лекарство. Пожалуйста, попробуйте позже.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Шапка с кнопкой выхода */}
      <Header appName="Управление лекарственными средствами" />

      {/* Основное содержимое */}
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Управление лекарственными средствами
        </h1>

        {/* Индикатор загрузки */}
        {loading && <Loader className="flex justify-center my-8" />}

        {/* Сообщение об ошибке */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Кнопка добавления нового лекарства */}
        <div className="flex justify-end mb-4">
          <Button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700">
            Добавить лекарство
          </Button>
        </div>

        {/* Таблица лекарств */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Название</th>
                <th className="py-2 px-4 border-b">Описание</th>
                <th className="py-2 px-4 border-b">Рекомендации по дозировке</th>
                <th className="py-2 px-4 border-b">Действия</th>
              </tr>
            </thead>
            <tbody>
              {medications.map((medication) => (
                <tr key={medication.MedicationID} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{medication.medicationid}</td>
                  <td className="py-2 px-4 border-b">{medication.name}</td>
                  <td className="py-2 px-4 border-b">{medication.description}</td>
                  <td className="py-2 px-4 border-b">{medication.dosagerecommendations}</td>
                  <td className="py-2 px-4 border-b">
                    <Button
                      onClick={() => openModal(medication)}
                      className="mr-2 bg-blue-600 hover:bg-blue-700"
                    >
                      Редактировать
                    </Button>
                    <Button
                      onClick={() => handleDelete(medication.medicationid)}
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

        {/* Модальное окно для добавления/редактирования лекарства */}
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentMedication ? "Редактировать лекарство" : "Добавить лекарство"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Название"
                name="Name"
                value={formData.Name}
                onChange={handleInputChange}
                placeholder="Введите название лекарства"
                required
              />
              <Input
                label="Описание"
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                placeholder="Введите описание"
                required
                multiline
              />
              <Input
                label="Рекомендации по дозировке"
                name="DosageRecommendations"
                value={formData.DosageRecommendations}
                onChange={handleInputChange}
                placeholder="Введите рекомендации по дозировке"
                required
                multiline
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
                  {currentMedication ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default ManageMedications