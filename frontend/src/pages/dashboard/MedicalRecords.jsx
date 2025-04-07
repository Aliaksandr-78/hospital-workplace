import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { createMedicalRecord, getAllMedicalRecords, getMedicalRecordById, updateMedicalRecord, deleteMedicalRecord } from "../../api/medicalRecordApi"
import { getAllPatients } from "../../api/patientApi"
import Button from "../../components/Button"
import Loader from "../../components/Loader"
import Input from "../../components/Input"
import Modal from "../../components/Modal"

const MedicalRecords = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [medicalRecords, setMedicalRecords] = useState([])
  const [patients, setPatients] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [formData, setFormData] = useState({
    PatientID: "",
    Diagnosis: "",
    TreatmentPlan: "",
    LabResults: "",
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
      if (currentRecord) {
        await updateMedicalRecord(currentRecord.RecordID, formData)
      } else {
        await createMedicalRecord(formData)
      }
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      console.error("Ошибка при сохранении медицинской карты:", error)
    }
  }

  const handleEdit = async (recordID) => {
    try {
      const record = await getMedicalRecordById(recordID)
      setCurrentRecord(record)
      setFormData({
        PatientID: record.PatientID,
        Diagnosis: record.Diagnosis,
        TreatmentPlan: record.TreatmentPlan,
        LabResults: JSON.stringify(record.LabResults),
      })
      setIsModalOpen(true)
    } catch (error) {
      console.error("Ошибка при загрузке медицинской карты:", error)
    }
  }

  const handleDelete = async (recordID) => {
    try {
      await deleteMedicalRecord(recordID)
      fetchData()
    } catch (error) {
      console.error("Ошибка при удалении медицинской карты:", error)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false);
    setCurrentRecord(null);
    setFormData({
      PatientID: "",
      Diagnosis: "",
      TreatmentPlan: "",
      LabResults: "",
    })
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Управление медицинскими картами</h1>

      <Button onClick={() => setIsModalOpen(true)} color="primary" className="mb-6">
        Создать новую медицинскую карту
      </Button>

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Пациент</th>
                <th className="px-4 py-2 border">Диагноз</th>
                <th className="px-4 py-2 border">План лечения</th>
                <th className="px-4 py-2 border">Результаты анализов</th>
                <th className="px-4 py-2 border">Действия</th>
              </tr>
            </thead>
            <tbody>
              {medicalRecords.map((record) => (
                <tr key={record.RecordID}>
                  <td className="px-4 py-2 border">
                    {patients.find((p) => p.PatientID === record.PatientID)?.LastName}{" "}
                    {patients.find((p) => p.PatientID === record.PatientID)?.FirstName}
                  </td>
                  <td className="px-4 py-2 border">{record.Diagnosis}</td>
                  <td className="px-4 py-2 border">{record.TreatmentPlan}</td>
                  <td className="px-4 py-2 border">{JSON.stringify(record.LabResults)}</td>
                  <td className="px-4 py-2 border">
                    <Button onClick={() => handleEdit(record.RecordID)} color="secondary" className="mr-2">
                      Редактировать
                    </Button>
                    <Button onClick={() => handleDelete(record.RecordID)} color="danger">
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
          {currentRecord ? "Редактировать медицинскую карту" : "Создать новую медицинскую карту"}
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
              label="Диагноз"
              name="Diagnosis"
              value={formData.Diagnosis}
              onChange={handleInputChange}
              type="text"
            />
            <Input
              label="План лечения"
              name="TreatmentPlan"
              value={formData.TreatmentPlan}
              onChange={handleInputChange}
              type="text"
            />
            <Input
              label="Результаты анализов"
              name="LabResults"
              value={formData.LabResults}
              onChange={handleInputChange}
              type="text"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <Button type="button" onClick={handleCancel} color="secondary">
              Отмена
            </Button>
            <Button type="submit" color="primary">
              {currentRecord ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default MedicalRecords