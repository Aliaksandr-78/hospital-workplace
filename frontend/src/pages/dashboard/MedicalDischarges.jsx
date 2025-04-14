import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { createMedicalDischarge, getAllMedicalDischarges, getMedicalDischargeById, updateMedicalDischarge, deleteMedicalDischarge } from "../../api/medicalDischargeApi"
import { getAllPatients } from "../../api/patientApi"
import { getAllUsers } from "../../api/userApi"
import Button from "../../components/Button"
import Loader from "../../components/Loader"
import Header from "../../components/Header"
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
        await updateMedicalDischarge(currentDischarge.dischargeid, formData)
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
        PatientID: discharge.patientid,
        DoctorID: discharge.doctorid,
        DischargeDate: discharge.dischargedate.split('T')[0],
        Summary: discharge.summary,
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
    <div className="min-h-screen bg-gray-100">
      <Header appName="Управление медицинскими выписками" />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Управление медицинскими выписками</h1>

        {loading ? (
          <Loader className="flex justify-center my-8" />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                Создать новую выписку
              </Button>
            </div>

            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Пациент</th>
                  <th className="py-2 px-4 border-b">Врач</th>
                  <th className="py-2 px-4 border-b">Дата выписки</th>
                  <th className="py-2 px-4 border-b">Заключение</th>
                  <th className="py-2 px-4 border-b">Действия</th>
                </tr>
              </thead>
              <tbody>
                {medicalDischarges.map((discharge) => (
                  <tr key={discharge.dischargeid} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {patients.find((p) => p.patientid === discharge.patientid)?.lastname}{" "}
                      {patients.find((p) => p.patientid === discharge.patientid)?.firstname}{" "}
                      {patients.find((p) => p.patientid === discharge.patientid)?.middlename}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {doctors.find((d) => d.userid === discharge.doctorid)?.lastname}{" "}
                      {doctors.find((d) => d.userid === discharge.doctorid)?.firstname}{" "}
                      {doctors.find((d) => d.userid === discharge.doctorid)?.middlename}
                    </td>
                    <td className="py-2 px-4 border-b">{new Date(discharge.dischargedate).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">{discharge.summary}</td>
                    <td className="py-2 px-4 border-b whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleEdit(discharge.dischargeid)} 
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Редактировать
                        </Button>
                        <Button 
                          onClick={() => handleDelete(discharge.dischargeid)} 
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
        )}

        <Modal isOpen={isModalOpen} onClose={handleCancel}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentDischarge ? "Редактировать выписку" : "Создать новую выписку"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Пациент"
                name="PatientID"
                value={formData.PatientID}
                onChange={handleInputChange}
                type="select"
              >
                <option value="">Выберите пациента</option>
                {patients.map((patient) => (
                  <option key={patient.patientid} value={patient.patientid}>
                    {patient.lastname} {patient.firstname} {patient.middlename}
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
                  <option key={doctor.userid} value={doctor.userid}>
                    {doctor.lastname} {doctor.firstname} {doctor.middlename}
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
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  onClick={handleCancel} 
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                >
                  {currentDischarge ? "Сохранить" : "Создать"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default MedicalDischarges