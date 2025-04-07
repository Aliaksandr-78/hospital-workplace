import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { createPrescription, getAllPrescriptions, getPrescriptionById, updatePrescription, deletePrescription } from "../../api/prescriptionApi"
import { getAllPatients } from "../../api/patientApi"
import { getAllUsers } from "../../api/userApi"
import { getAllMedications } from "../../api/medicationApi"
import Button from "../../components/Button"
import Loader from "../../components/Loader"
import Input from "../../components/Input"
import Modal from "../../components/Modal"

const Prescriptions = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [prescriptions, setPrescriptions] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [medications, setMedications] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPrescription, setCurrentPrescription] = useState(null)
  const [formData, setFormData] = useState({
    PatientID: "",
    DoctorID: user?.UserID || "",
    MedicationID: "",
    Dosage: "",
    Instructions: "",
  })

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [prescriptionsData, patientsData, doctorsData, medicationsData] = await Promise.all([
        getAllPrescriptions(),
        getAllPatients(),
        getAllUsers(),
        getAllMedications(),
      ])
      setPrescriptions(prescriptionsData)
      setPatients(patientsData)
      setDoctors(doctorsData)
      setMedications(medicationsData)
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
      if (currentPrescription) {
        await updatePrescription(currentPrescription.PrescriptionID, formData)
      } else {
        await createPrescription(formData)
      }
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      console.error("Ошибка при сохранении рецепта:", error)
    }
  }

  const handleEdit = async (prescriptionID) => {
    try {
      const prescription = await getPrescriptionById(prescriptionID)
      setCurrentPrescription(prescription)
      setFormData({
        PatientID: prescription.PatientID,
        DoctorID: prescription.DoctorID,
        MedicationID: prescription.MedicationID,
        Dosage: prescription.Dosage,
        Instructions: prescription.Instructions,
      })
      setIsModalOpen(true)
    } catch (error) {
      console.error("Ошибка при загрузке рецепта:", error)
    }
  }

  const handleDelete = async (prescriptionID) => {
    try {
      await deletePrescription(prescriptionID)
      fetchData()
    } catch (error) {
      console.error("Ошибка при удалении рецепта:", error)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false);
    setCurrentPrescription(null);
    setFormData({
      PatientID: "",
      DoctorID: user?.UserID || "",
      MedicationID: "",
      Dosage: "",
      Instructions: "",
    })
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Управление рецептами</h1>

      <Button onClick={() => setIsModalOpen(true)} color="primary" className="mb-6">
        Создать новый рецепт
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
                <th className="px-4 py-2 border">Лекарство</th>
                <th className="px-4 py-2 border">Дозировка</th>
                <th className="px-4 py-2 border">Инструкции</th>
                <th className="px-4 py-2 border">Действия</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((prescription) => (
                <tr key={prescription.PrescriptionID}>
                  <td className="px-4 py-2 border">
                    {patients.find((p) => p.PatientID === prescription.PatientID)?.LastName}{" "}
                    {patients.find((p) => p.PatientID === prescription.PatientID)?.FirstName}
                  </td>
                  <td className="px-4 py-2 border">
                    {doctors.find((d) => d.UserID === prescription.DoctorID)?.LastName}{" "}
                    {doctors.find((d) => d.UserID === prescription.DoctorID)?.FirstName}
                  </td>
                  <td className="px-4 py-2 border">
                    {medications.find((m) => m.MedicationID === prescription.MedicationID)?.Name}
                  </td>
                  <td className="px-4 py-2 border">{prescription.Dosage}</td>
                  <td className="px-4 py-2 border">{prescription.Instructions}</td>
                  <td className="px-4 py-2 border">
                    <Button onClick={() => handleEdit(prescription.PrescriptionID)} color="secondary" className="mr-2">
                      Редактировать
                    </Button>
                    <Button onClick={() => handleDelete(prescription.PrescriptionID)} color="danger">
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
          {currentPrescription ? "Редактировать рецепт" : "Создать новый рецепт"}
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
              label="Лекарство"
              name="MedicationID"
              value={formData.MedicationID}
              onChange={handleInputChange}
              type="select"
            >
              <option value="">Выберите лекарство</option>
              {medications.map((medication) => (
                <option key={medication.MedicationID} value={medication.MedicationID}>
                  {medication.Name}
                </option>
              ))}
            </Input>
            <Input
              label="Дозировка"
              name="Dosage"
              value={formData.Dosage}
              onChange={handleInputChange}
              type="text"
            />
            <Input
              label="Инструкции"
              name="Instructions"
              value={formData.Instructions}
              onChange={handleInputChange}
              type="text"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <Button type="button" onClick={handleCancel} color="secondary">
              Отмена
            </Button>
            <Button type="submit" color="primary">
              {currentPrescription ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Prescriptions