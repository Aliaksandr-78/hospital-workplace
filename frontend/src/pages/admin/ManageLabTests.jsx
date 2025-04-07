import { useEffect, useState } from "react"
import {
  getAllLabTests,
  createLabTest,
  updateLabTest,
  deleteLabTest,
} from "../../api/labTestCatalogApi";
import Button from "../../components/Button"
import Header from "../../components/Header"
import Loader from "../../components/Loader"
import Modal from "../../components/Modal"
import Input from "../../components/Input"

const ManageLabTests = () => {

  const [labTests, setLabTests] = useState([]) // Состояние для списка лабораторных тестов
  const [loading, setLoading] = useState(true) // Состояние для загрузки
  const [error, setError] = useState("") // Состояние для ошибок
  const [isModalOpen, setModalOpen] = useState(false) // Состояние для модального окна
  const [currentLabTest, setCurrentLabTest] = useState(null) // Состояние для текущего теста (редактирование/добавление)
  const [formData, setFormData] = useState({ Name: "", Methodology: "", Cost: "" }) // Состояние для данных формы

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        setLoading(true);
        const data = await getAllLabTests()
        setLabTests(data)
      } catch (error) {
        console.error("Ошибка при загрузке лабораторных тестов:", error)
        setError("Не удалось загрузить лабораторные тесты. Пожалуйста, попробуйте позже.")
      } finally {
        setLoading(false)
      }
    }

    fetchLabTests()
  }, [])

  // Обработчик открытия модального окна для добавления/редактирования
  const openModal = (labTest = null) => {
    setCurrentLabTest(labTest)
    setFormData(
      labTest
        ? { Name: labTest.name, Methodology: labTest.methodology, Cost: labTest.cost }
        : { Name: "", Methodology: "", Cost: "" }
    )
    setModalOpen(true)
  }

  // Обработчик закрытия модального окна
  const closeModal = () => {
    setModalOpen(false)
    setCurrentLabTest(null)
    setFormData({ Name: "", Methodology: "", Cost: "" })
  }

  // Обработчик изменения данных формы
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Обработчик отправки формы (добавление/редактирование)
  const handleSubmit = async (e) => {
    e.preventDefault()
    const LabTestData = {
      name: formData.Name,
      methodology: formData.Methodology,
      cost: formData.Cost
    }
    try {
      if (currentLabTest) {
        // Редактирование лабораторного теста
        const updatedLabTest = await updateLabTest(currentLabTest.testid, LabTestData)
        setLabTests((prev) =>
          prev.map((labTest) =>
            labTest.testid === updatedLabTest.testid ? updatedLabTest : labTest
          )
        )
      } else {
        // Добавление нового лабораторного теста
        const newLabTest = await createLabTest(LabTestData)
        setLabTests((prev) => [...prev, newLabTest])
      }
      closeModal()
    } catch (error) {
      console.error("Ошибка при сохранении лабораторного теста:", error)
      setError("Не удалось сохранить лабораторный тест. Пожалуйста, попробуйте позже.")
    }
  }

  // Обработчик удаления лабораторного теста
  const handleDelete = async (testID) => {
    try {
      await deleteLabTest(testID);
      setLabTests((prev) => prev.filter((labTest) => labTest.testid !== testID))
    } catch (error) {
      console.error("Ошибка при удалении лабораторного теста:", error)
      setError("Не удалось удалить лабораторный тест. Пожалуйста, попробуйте позже.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Шапка с кнопкой выхода */}
      <Header appName="Управление лабораторными тестами" />

      {/* Основное содержимое */}
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Управление лабораторными тестами
        </h1>

        {/* Индикатор загрузки */}
        {loading && <Loader className="flex justify-center my-8" />}

        {/* Сообщение об ошибке */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Кнопка добавления нового теста */}
        <div className="flex justify-end mb-4">
          <Button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700">
            Добавить тест
          </Button>
        </div>

        {/* Таблица лабораторных тестов */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Название</th>
                <th className="py-2 px-4 border-b">Методика</th>
                <th className="py-2 px-4 border-b">Стоимость</th>
                <th className="py-2 px-4 border-b">Действия</th>
              </tr>
            </thead>
            <tbody>
              {labTests.map((labTest) => (
                <tr key={labTest.TestID} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{labTest.testid}</td>
                  <td className="py-2 px-4 border-b">{labTest.name}</td>
                  <td className="py-2 px-4 border-b">{labTest.methodology}</td>
                  <td className="py-2 px-4 border-b">{labTest.cost} руб.</td>
                  <td className="py-2 px-4 border-b">
                    <Button
                      onClick={() => openModal(labTest)}
                      className="mr-2 bg-blue-600 hover:bg-blue-700"
                    >
                      Редактировать
                    </Button>
                    <Button
                      onClick={() => handleDelete(labTest.testid)}
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

        {/* Модальное окно для добавления/редактирования теста */}
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentLabTest ? "Редактировать тест" : "Добавить тест"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Название"
                name="Name"
                value={formData.Name}
                onChange={handleInputChange}
                placeholder="Введите название теста"
                required
              />
              <Input
                label="Методика"
                name="Methodology"
                value={formData.Methodology}
                onChange={handleInputChange}
                placeholder="Введите методику выполнения"
                required
                multiline
              />
              <Input
                label="Стоимость"
                name="Cost"
                type="number"
                value={formData.Cost}
                onChange={handleInputChange}
                placeholder="Введите стоимость"
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
                  {currentLabTest ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default ManageLabTests