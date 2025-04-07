import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { createMedicalCertificate, getAllMedicalCertificates, getMedicalCertificateById, updateMedicalCertificate, deleteMedicalCertificate } from "../../api/medicalCertificateApi"
import { getAllPatients } from "../../api/patientApi"
import Button from "../../components/Button"
import Loader from "../../components/Loader"
import Header from "../../components/Header"
import Input from "../../components/Input"
import Modal from "../../components/Modal"

const MedicalCertificates = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [medicalCertificates, setMedicalCertificates] = useState([])
  const [patients, setPatients] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentCertificate, setCurrentCertificate] = useState(null)
  const [formData, setFormData] = useState({
    PatientID: "",
    IssuedBy: user?.UserID || "",
    IssuedDate: "",
    CertificateType: "",
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
      const [certificatesData, patientsData] = await Promise.all([
        getAllMedicalCertificates(),
        getAllPatients(),
      ])
      setMedicalCertificates(certificatesData)
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
      if (currentCertificate) {
        await updateMedicalCertificate(currentCertificate.CertificateID, formData)
      } else {
        await createMedicalCertificate(formData)
      }
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      console.error("Ошибка при сохранении справки:", error)
    }
  }

  const handleEdit = async (certificateID) => {
    try {
      const certificate = await getMedicalCertificateById(certificateID)
      setCurrentCertificate(certificate)
      setFormData({
        PatientID: certificate.PatientID,
        IssuedBy: certificate.IssuedBy,
        IssuedDate: certificate.IssuedDate,
        CertificateType: certificate.CertificateType,
        Details: certificate.Details,
      })
      setIsModalOpen(true)
    } catch (error) {
      console.error("Ошибка при загрузке справки:", error)
    }
  }

  const handleDelete = async (certificateID) => {
    try {
      await deleteMedicalCertificate(certificateID)
      fetchData()
    } catch (error) {
      console.error("Ошибка при удалении справки:", error)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false);
    setCurrentCertificate(null);
    setFormData({
      PatientID: "",
      IssuedBy: user?.UserID || "",
      IssuedDate: "",
      CertificateType: "",
      Details: "",
    })
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Header appName="Управление медицинскими справками" />

      <Button onClick={() => setIsModalOpen(true)} color="primary" className="mb-6">
        Создать новую справку
      </Button>

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Пациент</th>
                <th className="px-4 py-2 border">Выдано</th>
                <th className="px-4 py-2 border">Дата выдачи</th>
                <th className="px-4 py-2 border">Тип справки</th>
                <th className="px-4 py-2 border">Детали</th>
                <th className="px-4 py-2 border">Действия</th>
              </tr>
            </thead>
            <tbody>
              {medicalCertificates.map((certificate) => (
                <tr key={certificate.CertificateID}>
                  <td className="px-4 py-2 border">
                    {patients.find((p) => p.PatientID === certificate.PatientID)?.LastName}{" "}
                    {patients.find((p) => p.PatientID === certificate.PatientID)?.FirstName}
                  </td>
                  <td className="px-4 py-2 border">
                    {user?.LastName} {user?.FirstName}
                  </td>
                  <td className="px-4 py-2 border">{certificate.IssuedDate}</td>
                  <td className="px-4 py-2 border">{certificate.CertificateType}</td>
                  <td className="px-4 py-2 border">{certificate.Details}</td>
                  <td className="px-4 py-2 border">
                    <Button onClick={() => handleEdit(certificate.CertificateID)} color="secondary" className="mr-2">
                      Редактировать
                    </Button>
                    <Button onClick={() => handleDelete(certificate.CertificateID)} color="danger">
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
          {currentCertificate ? "Редактировать справку" : "Создать новую справку"}
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
              label="Дата выдачи"
              name="IssuedDate"
              value={formData.IssuedDate}
              onChange={handleInputChange}
              type="date"
            />
            <Input
              label="Тип справки"
              name="CertificateType"
              value={formData.CertificateType}
              onChange={handleInputChange}
              type="text"
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
              {currentCertificate ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default MedicalCertificates