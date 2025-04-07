import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { createMedicalDischarge, getAllMedicalDischarges, getMedicalDischargeById, updateMedicalDischarge, deleteMedicalDischarge } from "../../api/medicalDischargeApi"
import { getAllPatients } from "../../api/patientApi"
import { getAllUsers } from "../../api/userApi"
import Button from "../../components/Button"
import Loader from "../../components/Loader"
import Input from "../../components/Input"
import Modal from "../../components/Modal"

const MedicalDischarges = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [medicalDischarges, setMedicalDischarges] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentDischarge, setCurrentDischarge] = useState(null)
  const [formData, setFormData] = useState({
    PatientID: "",
    DoctorID: user?.UserID || "",
    DischargeDate: "",
    Summary: "",
  })

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [dischargesData, patientsData, doctorsData] = await Promise.all([
        getAllMedicalDischarges(),
        getAllPatients(),
        getAllUsers(),
      ])
      setMedicalDischarges(dischargesData)
      setPatients(patientsData)
      setDoctors(doctorsData)
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
      if (currentDischarge) {
        await updateMedicalDischarge(currentDischarge.DischargeID, formData)
      } else {
        await createMedicalDischarge(formData)
      }
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      console.error("Ошибка при сохранении выписки:", error)
    }
  }

  const handleEdit = async (dischargeID) => {
    try {
      const discharge = await getMedicalDischargeById(dischargeID)
      setCurrentDischarge(discharge)
      setFormData({
        PatientID: discharge.PatientID,
        DoctorID: discharge.DoctorID,
        DischargeDate: discharge.DischargeDate,
        Summary: discharge.Summary,
      })
      setIsModalOpen(true)
    } catch (error) {
      console.error("Ошибка при загрузке выписки:", error)
    }
  }

  const handleDelete = async (dischargeID) => {
    try {
      await deleteMedicalDischarge(dischargeID)
      fetchData()
    } catch (error) {
      console.error("Ошибка при удалении выписки:", error)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false);
    setCurrentDischarge(null);
    setFormData({
      PatientID: "",
      DoctorID: user?.UserID || "",
      DischargeDate: "",
      Summary: "",
    })
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Управление выписками</h1>

      <Button onClick={() => setIsModalOpen(true)} color="primary" className="mb-6">
        Создать новую выписку
      </Button>

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Пациент</th>
                <th className="px-4 py-2 border">Врач</th>
                <th className="px-4 py-2 border">Дата выписки</th>
                <th className="px-4 py-2 border">Заключение</th>
                <th className="px-4 py-2 border">Действия</th>
              </tr>
            </thead>
            <tbody>
              {medicalDischarges.map((discharge) => (
                <tr key={discharge.DischargeID}>
                  <td className="px-4 py-2 border">
                    {patients.find((p) => p.PatientID === discharge.PatientID)?.LastName}{" "}
                    {patients.find((p) => p.PatientID === discharge.PatientID)?.FirstName}
                  </td>
                  <td className="px-4 py-2 border">
                    {doctors.find((d) => d.UserID === discharge.DoctorID)?.LastName}{" "}
                    {doctors.find((d) => d.UserID === discharge.DoctorID)?.FirstName}
                  </td>
                  <td className="px-4 py-2 border">{discharge.DischargeDate}</td>
                  <td className="px-4 py-2 border">{discharge.Summary}</td>
                  <td className="px-4 py-2 border">
                    <Button onClick={() => handleEdit(discharge.DischargeID)} color="secondary" className="mr-2">
                      Редактировать
                    </Button>
                    <Button onClick={() => handleDelete(discharge.DischargeID)} color="danger">
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
          {currentDischarge ? "Редактировать выписку" : "Создать новую выписку"}
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
              label="Врач"
              name="DoctorID"
              value={formData.DoctorID}
              onChange={handleInputChange}
              type="select"
            >
              <option value="">Выберите врача</option>
              {doctors.map((doctor) => (
                <option key={doctor.UserID} value={doctor.UserID}>
                  {doctor.LastName} {doctor.FirstName}
                </option>
              ))}
            </Input>
            <Input
              label="Дата выписки"
              name="DischargeDate"
              value={formData.DischargeDate}
              onChange={handleInputChange}
              type="date"
            />
            <Input
              label="Заключение"
              name="Summary"
              value={formData.Summary}
              onChange={handleInputChange}
              type="text"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <Button type="button" onClick={handleCancel} color="secondary">
              Отмена
            </Button>
            <Button type="submit" color="primary">
              {currentDischarge ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default MedicalDischarges