import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { createMedicalRecord, getAllMedicalRecords, deleteMedicalRecord } from "../../api/medicalRecordApi"
import { getAllPatients } from "../../api/patientApi"
import Button from "../../components/Button"
import Header from "../../components/Header"
import Loader from "../../components/Loader"
import Input from "../../components/Input"
import Modal from "../../components/Modal"

const MedicalRecords = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [medicalRecords, setMedicalRecords] = useState([])
  const [patients, setPatients] = useState([])
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    PatientID: ""
  })

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [recordsData, patientsData] = await Promise.all([
        getAllMedicalRecords(),
        getAllPatients(),
      ])
      setMedicalRecords(recordsData)
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
      if (!formData.PatientID) {
        setError("Необходимо выбрать пациента")
        return
      }

      await createMedicalRecord(formData)
      setIsModalOpen(false)
      fetchData()
      setError("")
    } catch (error) {
      console.error("Ошибка при создании медицинской карты:", error)
      setError("Не удалось создать медицинскую карту. Пожалуйста, попробуйте позже.")
    }
  }

  const handleDelete = async (recordID) => {
    try {
      await deleteMedicalRecord(recordID)
      fetchData()
    } catch (error) {
      console.error("Ошибка при удалении медицинской карты:", error)
      setError("Не удалось удалить медицинскую карту. Пожалуйста, попробуйте позже.")
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setFormData({ PatientID: "" })
    setError("")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Медицинские карты пациентов" />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Медицинские карты пациентов</h1>

        {loading && <Loader className="flex justify-center my-8" />}

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-green-600 hover:bg-green-700"
          >
            Создать новую медицинскую карту
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-center">Пациент</th>
                <th className="py-2 px-4 border-b text-center">Дата создания</th>
                <th className="py-2 px-4 border-b text-center">Действия</th>
              </tr>
            </thead>
            <tbody>
              {medicalRecords.map((record) => (
                <tr key={record.recordid} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-center">
                    {patients.find((p) => p.patientid === record.patientid)?.lastname}{" "}
                    {patients.find((p) => p.patientid === record.patientid)?.firstname}{" "}
                    {patients.find((p) => p.patientid === record.patientid)?.middlename}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {new Date(record.createdat).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <div className="flex justify-center space-x-2">
                      <Button
                        onClick={() => navigate(`/patient-medical-record/${record.recordid}`)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Перейти
                      </Button>
                      <Button
                        onClick={() => handleDelete(record.recordid)}
                        className="bg-red-600 hover:bg-red-700"
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

        <Modal isOpen={isModalOpen} onClose={handleCancel}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Создать новую медицинскую карту</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Пациент"
                name="PatientID"
                value={formData.PatientID}
                onChange={handleInputChange}
                type="select"
                required
              >
                <option value="">Выберите пациента</option>
                {patients.map((patient) => (
                  <option key={patient.patientid} value={patient.patientid}>
                    {patient.lastname} {patient.firstname} {patient.middlename}
                  </option>
                ))}
              </Input>
              
              {error && <p className="text-red-500">{error}</p>}
              
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

export default MedicalRecords