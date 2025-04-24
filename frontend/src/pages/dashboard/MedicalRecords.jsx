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
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientSearch, setPatientSearch] = useState("")

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handlePatientSearchChange = (e) => {
    setPatientSearch(e.target.value)
  }

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient)
    setPatientSearch(`${patient.lastname} ${patient.firstname} ${patient.middlename}`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!selectedPatient) {
        setError("Необходимо выбрать пациента")
        return
      }
      
      await createMedicalRecord({ PatientID: selectedPatient.patientid })
      setIsModalOpen(false)
      fetchData()
      setError("")
      setSelectedPatient(null)
      setPatientSearch("")
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
    setSelectedPatient(null)
    setPatientSearch("")
    setError("")
  }

  // Фильтрация пациентов для поиска
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.lastname} ${patient.firstname} ${patient.middlename}`.toLowerCase()
    return fullName.includes(patientSearch.toLowerCase())
  })

  // Фильтрация медицинских карт для основного поиска
  const filteredRecords = medicalRecords.filter(record => {
    const patient = patients.find(p => p.patientid === record.patientid)
    if (!patient) return false
    const fullName = `${patient.lastname} ${patient.firstname} ${patient.middlename}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Медицинские карты пациентов" />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Медицинские карты пациентов</h1>

        {loading && <Loader className="flex justify-center my-8" />}

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex justify-between mb-4">
          <div className="w-1/2">
            <Input
              type="text"
              placeholder="Поиск карт по пациенту..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full"
            />
          </div>
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
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-gray-500">
                    {searchTerm ? "Ничего не найдено" : "Нет медицинских карт"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isModalOpen} onClose={handleCancel}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Создать новую медицинскую карту</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Поиск пациента*</label>
                <Input
                  type="text"
                  placeholder="Введите ФИО пациента..."
                  value={patientSearch}
                  onChange={handlePatientSearchChange}
                  className="w-full"
                />
                {selectedPatient && (
                  <div className="p-2 bg-gray-100 rounded">
                    Выбран: {selectedPatient.lastname} {selectedPatient.firstname} {selectedPatient.middlename}
                  </div>
                )}
                <div className="max-h-60 overflow-y-auto border rounded">
                  {filteredPatients.map(patient => (
                    <div 
                      key={patient.patientid}
                      className={`p-2 hover:bg-blue-50 cursor-pointer ${selectedPatient?.patientid === patient.patientid ? 'bg-blue-100' : ''}`}
                      onClick={() => handleSelectPatient(patient)}
                    >
                      {patient.lastname} {patient.firstname} {patient.middlename}
                    </div>
                  ))}
                </div>
              </div>
              
              {error && <p className="text-red-500">{error}</p>}
              
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
                  disabled={!selectedPatient}
                >
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