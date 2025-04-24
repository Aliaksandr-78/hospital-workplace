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
  const [filteredDischarges, setFilteredDischarges] = useState([])
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
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [patientSearch, setPatientSearch] = useState("")
  const [doctorSearch, setDoctorSearch] = useState("")
  const [filteredPatients, setFilteredPatients] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  useEffect(() => {
    filterAndSortDischarges()
  }, [medicalDischarges, searchTerm, dateFilter, sortConfig])

  useEffect(() => {
    if (patients.length > 0) {
      setFilteredPatients(
        patients.filter(patient => 
          `${patient.lastname} ${patient.firstname} ${patient.middlename}`
            .toLowerCase()
            .includes(patientSearch.toLowerCase())
        )
      )
    }
  }, [patientSearch, patients])

  useEffect(() => {
    if (doctors.length > 0) {
      setFilteredDoctors(
        doctors.filter(doctor => 
          `${doctor.lastname} ${doctor.firstname} ${doctor.middlename}`
            .toLowerCase()
            .includes(doctorSearch.toLowerCase())
        )
      )
    }
  }, [doctorSearch, doctors])

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
      setFilteredPatients(patientsData)
      setDoctors(doctorsData)
      setFilteredDoctors(doctorsData)
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortDischarges = () => {
    let result = [...medicalDischarges]
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(discharge => {
        const patient = patients.find(p => p.patientid === discharge.patientid)
        if (!patient) return false
        return (
          patient.lastname.toLowerCase().includes(searchLower) ||
          patient.firstname.toLowerCase().includes(searchLower) ||
          patient.middlename.toLowerCase().includes(searchLower)
      )})
    }
    
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString()
      result = result.filter(discharge => {
        const dischargeDate = new Date(discharge.dischargedate).toDateString()
        return dischargeDate === filterDate
      })
    }
    
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valueA, valueB
        
        if (sortConfig.key === 'patient') {
          const patientA = patients.find(p => p.patientid === a.patientid)
          const patientB = patients.find(p => p.patientid === b.patientid)
          valueA = patientA ? `${patientA.lastname} ${patientA.firstname} ${patientA.middlename}` : ''
          valueB = patientB ? `${patientB.lastname} ${patientB.firstname} ${patientB.middlename}` : ''
        } else if (sortConfig.key === 'doctor') {
          const doctorA = doctors.find(d => d.userid === a.doctorid)
          const doctorB = doctors.find(d => d.userid === b.doctorid)
          valueA = doctorA ? `${doctorA.lastname} ${doctorA.firstname} ${doctorA.middlename}` : ''
          valueB = doctorB ? `${doctorB.lastname} ${doctorB.firstname} ${doctorB.middlename}` : ''
        } else {
          valueA = a[sortConfig.key]
          valueB = b[sortConfig.key]
        }
        
        if (valueA < valueB) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    
    setFilteredDischarges(result)
  }

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value)
  }

  const handlePatientSearchChange = (e) => {
    setPatientSearch(e.target.value)
  }

  const handleDoctorSearchChange = (e) => {
    setDoctorSearch(e.target.value)
  }

  const handleSelectPatient = (patientId) => {
    setFormData({ ...formData, PatientID: patientId })
    setPatientSearch("")
  }

  const handleSelectDoctor = (doctorId) => {
    setFormData({ ...formData, DoctorID: doctorId })
    setDoctorSearch("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!formData.PatientID || !formData.DoctorID || !formData.DischargeDate) {
        alert('Пожалуйста, заполните все обязательные поля')
        return
      }
      
      const dataToSend = {
        ...formData,
        DischargeDate: new Date(formData.DischargeDate).toISOString()
      }
      
      if (currentDischarge) {
        await updateMedicalDischarge(currentDischarge.dischargeid, dataToSend)
      } else {
        await createMedicalDischarge(dataToSend)
      }
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      console.error("Ошибка при сохранении выписки:", error)
      alert(`Ошибка при сохранении: ${error.response?.data?.error || error.message}`)
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
      
      // Установка поисковых значений для отображения выбранных значений
      const patient = patients.find(p => p.patientid === discharge.patientid)
      if (patient) {
        setPatientSearch(`${patient.lastname} ${patient.firstname} ${patient.middlename}`)
      }
      
      const doctor = doctors.find(d => d.userid === discharge.doctorid)
      if (doctor) {
        setDoctorSearch(`${doctor.lastname} ${doctor.firstname} ${doctor.middlename}`)
      }
      
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
    setIsModalOpen(false)
    setCurrentDischarge(null)
    setFormData({
      PatientID: "",
      DoctorID: user?.UserID || "",
      DischargeDate: "",
      Summary: "",
    })
    setPatientSearch("")
    setDoctorSearch("")
  }

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  const getSelectedPatientName = () => {
    if (!formData.PatientID) return ""
    const patient = patients.find(p => p.patientid === formData.PatientID)
    return patient ? `${patient.lastname} ${patient.firstname} ${patient.middlename}` : ""
  }

  const getSelectedDoctorName = () => {
    if (!formData.DoctorID) return ""
    const doctor = doctors.find(d => d.userid === formData.DoctorID)
    return doctor ? `${doctor.lastname} ${doctor.firstname} ${doctor.middlename}` : ""
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
            <div className="flex justify-between mb-4 flex-wrap gap-4">
              <div className="flex space-x-4">
                <Input
                  type="text"
                  placeholder="Поиск по пациенту..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-64"
                />
                <Input
                  type="date"
                  placeholder="Фильтр по дате..."
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                />
                {(searchTerm || dateFilter) && (
                  <Button 
                    onClick={() => {
                      setSearchTerm("")
                      setDateFilter("")
                    }} 
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Сбросить фильтры
                  </Button>
                )}
              </div>
              <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                Создать новую выписку
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th 
                      className="py-2 px-4 border-b cursor-pointer hover:bg-gray-50"
                      onClick={() => requestSort('patient')}
                    >
                      Пациент {getSortIndicator('patient')}
                    </th>
                    <th 
                      className="py-2 px-4 border-b cursor-pointer hover:bg-gray-50"
                      onClick={() => requestSort('doctor')}
                    >
                      Врач {getSortIndicator('doctor')}
                    </th>
                    <th 
                      className="py-2 px-4 border-b cursor-pointer hover:bg-gray-50"
                      onClick={() => requestSort('dischargedate')}
                    >
                      Дата выписки {getSortIndicator('dischargedate')}
                    </th>
                    <th className="py-2 px-4 border-b">Заключение</th>
                    <th className="py-2 px-4 border-b">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDischarges.length > 0 ? (
                    filteredDischarges.map((discharge) => (
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-gray-500">
                        {medicalDischarges.length === 0 ? "Нет данных о выписках" : "Ничего не найдено"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={handleCancel}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentDischarge ? "Редактировать выписку" : "Создать новую выписку"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Пациент</label>
                <Input
                  type="text"
                  placeholder="Поиск пациента..."
                  value={patientSearch}
                  onChange={handlePatientSearchChange}
                  className="w-full"
                />
                {formData.PatientID && (
                  <div className="p-2 bg-gray-100 rounded">
                    Выбран: {getSelectedPatientName()}
                  </div>
                )}
                <div className="max-h-60 overflow-y-auto border rounded">
                  {filteredPatients.map(patient => (
                    <div 
                      key={patient.patientid}
                      className={`p-2 hover:bg-blue-50 cursor-pointer ${formData.PatientID === patient.patientid ? 'bg-blue-100' : ''}`}
                      onClick={() => handleSelectPatient(patient.patientid)}
                    >
                      {patient.lastname} {patient.firstname} {patient.middlename}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Врач</label>
                <Input
                  type="text"
                  placeholder="Поиск врача..."
                  value={doctorSearch}
                  onChange={handleDoctorSearchChange}
                  className="w-full"
                />
                {formData.DoctorID && (
                  <div className="p-2 bg-gray-100 rounded">
                    Выбран: {getSelectedDoctorName()}
                  </div>
                )}
                <div className="max-h-60 overflow-y-auto border rounded">
                  {filteredDoctors.map(doctor => (
                    <div 
                      key={doctor.userid}
                      className={`p-2 hover:bg-blue-50 cursor-pointer ${formData.DoctorID === doctor.userid ? 'bg-blue-100' : ''}`}
                      onClick={() => handleSelectDoctor(doctor.userid)}
                    >
                      {doctor.lastname} {doctor.firstname} {doctor.middlename}
                    </div>
                  ))}
                </div>
              </div>

              <Input
                label="Дата выписки"
                name="DischargeDate"
                value={formData.DischargeDate}
                onChange={handleInputChange}
                type="date"
                required
              />
              <Input
                label="Заключение"
                name="Summary"
                value={formData.Summary}
                onChange={handleInputChange}
                type="textarea"
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