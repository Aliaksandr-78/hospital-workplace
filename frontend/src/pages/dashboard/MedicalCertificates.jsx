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
        await updateMedicalCertificate(currentCertificate.certificateid, formData)
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
        PatientID: certificate.patientid,
        IssuedBy: certificate.issuedby,
        IssuedDate: certificate.issueddate.split('T')[0],
        CertificateType: certificate.certificatetype,
        Details: certificate.details,
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
    <div className="min-h-screen bg-gray-100">
      <Header appName="Управление медицинскими справками" />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Управление медицинскими справками</h1>

        {loading ? (
          <Loader className="flex justify-center my-8" />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                Создать новую справку
              </Button>
            </div>

            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Пациент</th>
                  <th className="py-2 px-4 border-b">Выдано</th>
                  <th className="py-2 px-4 border-b">Дата выдачи</th>
                  <th className="py-2 px-4 border-b">Тип справки</th>
                  <th className="py-2 px-4 border-b">Детали</th>
                  <th className="py-2 px-4 border-b">Действия</th>
                </tr>
              </thead>
              <tbody>
                {medicalCertificates.map((certificate) => (
                  <tr key={certificate.certificateid} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {patients.find((p) => p.patientid === certificate.patientid)?.lastname}{" "}
                      {patients.find((p) => p.patientid === certificate.patientid)?.firstname}{" "}
                      {patients.find((p) => p.patientid === certificate.patientid)?.middlename}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {user?.lastname} {user?.firstname} {user?.middlename}
                    </td>
                    <td className="py-2 px-4 border-b">{new Date(certificate.issueddate).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">{certificate.certificatetype}</td>
                    <td className="py-2 px-4 border-b">{certificate.details}</td>
                    <td className="py-2 px-4 border-b whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleEdit(certificate.certificateid)} 
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Редактировать
                        </Button>
                        <Button 
                          onClick={() => handleDelete(certificate.certificateid)} 
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
              {currentCertificate ? "Редактировать справку" : "Создать новую справку"}
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
                  {currentCertificate ? "Сохранить" : "Создать"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default MedicalCertificates