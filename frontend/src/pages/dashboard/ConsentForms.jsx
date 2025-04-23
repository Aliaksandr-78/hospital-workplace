import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { createConsentForm, getAllConsentForms, deleteConsentForm } from "../../api/consentFormApi"
import { getAllPatients } from "../../api/patientApi"
import Button from "../../components/Button"
import Header from "../../components/Header"
import Loader from "../../components/Loader"
import Input from "../../components/Input"
import Modal from "../../components/Modal"

const ConsentForms = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [consentForms, setConsentForms] = useState([])
  const [patients, setPatients] = useState([])
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    patientid: "",
    procedure: "",
    date: "",
    details: "",
  })

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [consentFormsData, patientsData] = await Promise.all([
        getAllConsentForms(),
        getAllPatients(),
      ])
      setConsentForms(consentFormsData)
      setPatients(patientsData)
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error)
      setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!formData.patientid || !formData.procedure || !formData.date) {
        setError("Все обязательные поля должны быть заполнены")
        return
      }

      await createConsentForm(formData)
      setIsModalOpen(false)
      fetchData()
      setError("")
    } catch (error) {
      console.error("Ошибка при сохранении согласия:", error)
      setError("Не удалось сохранить согласие. Пожалуйста, попробуйте позже.")
    }
  }

  const handleDelete = async (consentFormID) => {
    try {
      await deleteConsentForm(consentFormID)
      fetchData()
    } catch (error) {
      console.error("Ошибка при удалении согласия:", error)
      setError("Не удалось удалить согласие. Пожалуйста, попробуйте позже.")
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setFormData({
      patientid: "",
      procedure: "",
      date: "",
      details: "",
    })
    setError("")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Управление согласиями" />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Управление согласиями</h1>

        {loading && <Loader className="flex justify-center my-8" />}

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-green-600 hover:bg-green-700"
          >
            Создать новое согласие
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Пациент</th>
                <th className="py-2 px-4 border-b">Процедура</th>
                <th className="py-2 px-4 border-b">Дата</th>
                <th className="py-2 px-4 border-b">Детали</th>
                <th className="py-2 px-4 border-b">Действия</th>
              </tr>
            </thead>
            <tbody>
              {consentForms.map((consentForm) => (
                <tr key={consentForm.ConsentFormID} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">
                    {patients.find((p) => p.patientid === consentForm.patientid)?.lastname}{" "}
                    {patients.find((p) => p.patientid === consentForm.patientid)?.firstname}{" "}
                    {patients.find((p) => p.patientid === consentForm.patientid)?.middlename}
                  </td>
                  <td className="py-2 px-4 border-b">{consentForm.procedure}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(consentForm.date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b">{consentForm.details}</td>
                  <td className="py-2 px-4 border-b">
                    <Button
                      onClick={() => handleDelete(consentForm.consentformid)}
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

        <Modal isOpen={isModalOpen} onClose={handleCancel}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Создать новое согласие</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Пациент"
                name="patientid"
                value={formData.PatientID}
                onChange={handleInputChange}
                type="select"
                required
              >
                <option value="">Выберите пациента</option>
                {patients.map((patient) => (
                  <option key={patient.patientid} value={patient.patientid}>
                    {patient.lastname} {patient.firstname}
                  </option>
                ))}
              </Input>
              <Input
                label="Процедура"
                name="procedure"
                value={formData.Procedure}
                onChange={handleInputChange}
                type="text"
                required
              />
              <Input
                label="Дата"
                name="date"
                value={formData.Date}
                onChange={handleInputChange}
                type="date"
                required
              />
              <Input
                label="Детали"
                name="details"
                value={formData.Details}
                onChange={handleInputChange}
                type="text"
              />
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Отмена
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Создать
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default ConsentForms