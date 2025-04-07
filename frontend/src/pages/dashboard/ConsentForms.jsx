import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { createConsentForm, getAllConsentForms, getConsentFormById, deleteConsentForm } from "../../api/consentFormApi"
import { getAllPatients } from "../../api/patientApi"
import Button from "../../components/Button"
import Loader from "../../components/Loader"
import Input from "../../components/Input"
import Modal from "../../components/Modal"

const ConsentForms = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [consentForms, setConsentForms] = useState([])
  const [patients, setPatients] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentConsentForm, setCurrentConsentForm] = useState(null)
  const [formData, setFormData] = useState({
    PatientID: "",
    Procedure: "",
    Date: "",
    Details: "",
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
        await createConsentForm(formData)
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      console.error("Ошибка при сохранении согласия:", error)
    }
  }

  const handleEdit = async (consentFormID) => {
    try {
      const consentForm = await getConsentFormById(consentFormID)
      setCurrentConsentForm(consentForm);
      setFormData({
        PatientID: consentForm.PatientID,
        Procedure: consentForm.Procedure,
        Date: consentForm.Date,
        Details: consentForm.Details,
      })
      setIsModalOpen(true)
    } catch (error) {
      console.error("Ошибка при загрузке согласия:", error)
    }
  }

  const handleDelete = async (consentFormID) => {
    try {
      await deleteConsentForm(consentFormID)
      fetchData()
    } catch (error) {
      console.error("Ошибка при удалении согласия:", error)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setCurrentConsentForm(null)
    setFormData({
      PatientID: "",
      Procedure: "",
      Date: "",
      Details: "",
    })
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Управление согласиями</h1>

      <Button onClick={() => setIsModalOpen(true)} color="primary" className="mb-6">
        Создать новое согласие
      </Button>

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Пациент</th>
                <th className="px-4 py-2 border">Процедура</th>
                <th className="px-4 py-2 border">Дата</th>
                <th className="px-4 py-2 border">Детали</th>
                <th className="px-4 py-2 border">Действия</th>
              </tr>
            </thead>
            <tbody>
              {consentForms.map((consentForm) => (
                <tr key={consentForm.ConsentFormID}>
                  <td className="px-4 py-2 border">
                    {patients.find((p) => p.PatientID === consentForm.PatientID)?.LastName}{" "}
                    {patients.find((p) => p.PatientID === consentForm.PatientID)?.FirstName}
                  </td>
                  <td className="px-4 py-2 border">{consentForm.Procedure}</td>
                  <td className="px-4 py-2 border">{consentForm.Date}</td>
                  <td className="px-4 py-2 border">{consentForm.Details}</td>
                  <td className="px-4 py-2 border">
                    <Button onClick={() => handleEdit(consentForm.ConsentFormID)} color="secondary" className="mr-2">
                      Редактировать
                    </Button>
                    <Button onClick={() => handleDelete(consentForm.ConsentFormID)} color="danger">
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCancel}>
        <h2 className="text-xl font-semibold mb-4">
          {currentConsentForm ? "Редактировать согласие" : "Создать новое согласие"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Пациент"
              name="PatientID"
              value={formData.PatientID}
              onChange={handleInputChange}
              type="select"
            >
              <option value="">Выберите пациента</option>
              {patients.map((patient) => (
                <option key={patient.PatientID} value={patient.PatientID}>
                  {patient.LastName} {patient.FirstName}
                </option>
              ))}
            </Input>
            <Input
              label="Процедура"
              name="Procedure"
              value={formData.Procedure}
              onChange={handleInputChange}
              type="text"
            />
            <Input
              label="Дата"
              name="Date"
              value={formData.Date}
              onChange={handleInputChange}
              type="date"
            />
            <Input
              label="Детали"
              name="Details"
              value={formData.Details}
              onChange={handleInputChange}
              type="text"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <Button type="button" onClick={handleCancel} color="secondary">
              Отмена
            </Button>
            <Button type="submit" color="primary">
              {currentConsentForm ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ConsentForms