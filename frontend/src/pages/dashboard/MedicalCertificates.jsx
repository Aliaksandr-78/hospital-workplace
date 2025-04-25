import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { createMedicalCertificate, getAllMedicalCertificates, getMedicalCertificateById, updateMedicalCertificate, deleteMedicalCertificate } from "../../api/medicalCertificateApi"
import { getAllPatients } from "../../api/patientApi"
import { getAllRoles } from "../../api/roleApi"
import { getUserRolesByUserId } from "../../api/userRoleApi"
import Button from "../../components/Button"
import Loader from "../../components/Loader"
import Header from "../../components/Header"
import Input from "../../components/Input"
import Modal from "../../components/Modal"

const MedicalCertificates = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [medicalCertificates, setMedicalCertificates] = useState([])
  const [filteredCertificates, setFilteredCertificates] = useState([])
  const [patients, setPatients] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentCertificate, setCurrentCertificate] = useState(null)
  const [formData, setFormData] = useState({
    patientID: "",
    issuedBy: user?.userid || "",
    issuedDate: "",
    certificateType: "",
    details: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [patientSearch, setPatientSearch] = useState("")
  const [filteredPatients, setFilteredPatients] = useState([])
  const [userRoles, setUserRoles] = useState([])
  const [allRoles, setAllRoles] = useState([])

  // Проверка ролей
  const isDoctor = () => {
    return userRoles.some(userRole => {
      const role = allRoles.find(r => r.roleid === userRole.roleid)
      return role && role.rolename === "Doctor"
    })
  }

  useEffect(() => {
    if (user) {
      fetchData()
      fetchUserRoles()
    }
  }, [user])

  const fetchUserRoles = async () => {
    try {
      const [rolesData, userRolesData] = await Promise.all([
        getAllRoles(),
        user?.userid ? getUserRolesByUserId(user.userid) : Promise.resolve([]),
      ])
      setAllRoles(rolesData)
      setUserRoles(userRolesData)
    } catch (error) {
      console.error("Ошибка при загрузке ролей:", error)
    }
  }

  useEffect(() => {
    filterAndSortCertificates()
  }, [medicalCertificates, searchTerm, dateFilter, typeFilter, sortConfig])

  useEffect(() => {
    if (patients.length > 0) {
      setFilteredPatients(
        patients.filter(patient => 
          `${patient.lastname} ${patient.firstname} ${patient.middlename}`
            .toLowerCase()
            .includes(patientSearch.toLowerCase())
      )
    )}
  }, [patientSearch, patients])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [certificatesData, patientsData] = await Promise.all([
        getAllMedicalCertificates(),
        getAllPatients(),
      ])
      setMedicalCertificates(certificatesData)
      setPatients(patientsData)
      setFilteredPatients(patientsData)
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortCertificates = () => {
    try {
      let result = [...medicalCertificates]
      
      // Фильтрация по поиску пациента
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        result = result.filter(certificate => {
          const patient = patients.find(p => p.patientid === certificate.patientid)
          if (!patient) return false
          
          const fullName = `${patient.lastname || ''} ${patient.firstname || ''} ${patient.middlename || ''}`.toLowerCase()
          return fullName.includes(searchLower)
        })
      }
      
      // Фильтрация по дате
      if (dateFilter) {
        try {
          const filterDate = new Date(dateFilter).toDateString()
          result = result.filter(certificate => {
            try {
              const certificateDate = new Date(certificate.issueddate).toDateString()
              return certificateDate === filterDate
            } catch (e) {
              console.error("Ошибка обработки даты справки:", e)
              return false
            }
          })
        } catch (e) {
          console.error("Ошибка обработки даты фильтра:", e)
        }
      }
      
      // Фильтрация по типу справки
      if (typeFilter) {
        result = result.filter(certificate => 
          certificate.certificatetype && 
          certificate.certificatetype.toLowerCase().includes(typeFilter.toLowerCase())
        )
      }
      
      // Сортировка
      if (sortConfig.key) {
        result.sort((a, b) => {
          try {
            let valueA, valueB
            
            if (sortConfig.key === 'patient') {
              const patientA = patients.find(p => p.patientid === a.patientid)
              const patientB = patients.find(p => p.patientid === b.patientid)
              valueA = patientA ? `${patientA.lastname || ''} ${patientA.firstname || ''} ${patientA.middlename || ''}` : ''
              valueB = patientB ? `${patientB.lastname || ''} ${patientB.firstname || ''} ${patientB.middlename || ''}` : ''
            } else if (sortConfig.key === 'type') {
              valueA = a.certificatetype || ''
              valueB = b.certificatetype || ''
            } else {
              valueA = a[sortConfig.key] || ''
              valueB = b[sortConfig.key] || ''
            }
            
            if (valueA < valueB) {
              return sortConfig.direction === 'asc' ? -1 : 1
            }
            if (valueA > valueB) {
              return sortConfig.direction === 'asc' ? 1 : -1
            }
            return 0
          } catch (e) {
            console.error("Ошибка сортировки:", e)
            return 0
          }
        })
      }
      
      setFilteredCertificates(result)
    } catch (error) {
      console.error("Ошибка в filterAndSortCertificates:", error)
      setFilteredCertificates([])
    }
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

  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value)
  }

  const handlePatientSearchChange = (e) => {
    try {
      const searchValue = e.target.value
      setPatientSearch(searchValue)
      
      if (!searchValue) {
        setFilteredPatients(patients)
        return
      }
      
      const searchLower = searchValue.toLowerCase()
      const filtered = patients.filter(patient => {
        const fullName = `${patient.lastname || ''} ${patient.firstname || ''} ${patient.middlename || ''}`.toLowerCase()
        return fullName.includes(searchLower)
      })
      
      setFilteredPatients(filtered)
    } catch (error) {
      console.error("Ошибка при поиске пациента:", error)
      setFilteredPatients(patients)
    }
  }

  const handleSelectPatient = (patientId) => {
    setFormData({ ...formData, patientID: patientId })
    setPatientSearch("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Проверка что дата не раньше сегодняшнего дня
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const issuedDate = new Date(formData.issuedDate)
      
      if (issuedDate < today) {
        alert('Дата выдачи справки не может быть раньше сегодняшнего дня')
        return
      }

      if (!formData.patientID || !formData.issuedDate || !formData.certificateType) {
        alert('Пожалуйста, заполните все обязательные поля')
        return
      }

      if (!user?.userid) {
        alert('Ошибка авторизации. Пожалуйста, войдите снова.')
        return
      }

      const certificateData = {
        patientID: Number(formData.patientID),
        issuedBy: Number(user.userid),
        issuedDate: formData.issuedDate,
        certificateType: formData.certificateType,
        details: formData.details || null
      }

      if (currentCertificate) {
        // Проверка что врач редактирует свою справку
        if (currentCertificate.issuedby !== user.userid) {
          alert('Вы можете редактировать только свои справки')
          return
        }
        await updateMedicalCertificate(currentCertificate.certificateid, certificateData)
      } else {
        await createMedicalCertificate(certificateData)
      }
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      console.error("Ошибка при сохранении справки:", error)
      alert(`Ошибка при сохранении: ${error.response?.data?.error || error.message}`)
    }
  }

  const handleEdit = async (certificateID) => {
    try {
      const certificate = await getMedicalCertificateById(certificateID)
      setCurrentCertificate(certificate)
      setFormData({
        patientID: certificate.patientid.toString(),
        issuedBy: user?.userid || "",
        issuedDate: certificate.issueddate.split('T')[0],
        certificateType: certificate.certificatetype,
        details: certificate.details || "",
      })
      
      const patient = patients.find(p => p.patientid === certificate.patientid)
      if (patient) {
        setPatientSearch(`${patient.lastname} ${patient.firstname} ${patient.middlename}`)
      }
      
      setIsModalOpen(true)
    } catch (error) {
      console.error("Ошибка при загрузке справки:", error)
    }
  }

  const handleDelete = async (certificateID) => {
    try {
      // Проверка что врач удаляет свою справку
      const certificate = medicalCertificates.find(c => c.certificateid === certificateID)
      if (certificate?.issuedby !== user?.userid) {
        alert('Вы можете удалять только свои справки')
        return
      }
      
      await deleteMedicalCertificate(certificateID)
      fetchData()
    } catch (error) {
      console.error("Ошибка при удалении справки:", error)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setCurrentCertificate(null)
    setFormData({
      patientID: "",
      issuedBy: user?.userid || "",
      issuedDate: "",
      certificateType: "",
      details: "",
    })
    setPatientSearch("")
  }

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  const getSelectedPatientName = () => {
    if (!formData.patientID) return ""
    const patient = patients.find(p => p.patientid === Number(formData.patientID))
    return patient ? `${patient.lastname} ${patient.firstname} ${patient.middlename}` : ""
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
            <div className="flex justify-between mb-4 flex-wrap gap-4">
              <div className="flex space-x-4 flex-wrap">
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
                <Input
                  type="text"
                  placeholder="Фильтр по типу..."
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                />
                {(searchTerm || dateFilter || typeFilter) && (
                  <Button 
                    onClick={() => {
                      setSearchTerm("")
                      setDateFilter("")
                      setTypeFilter("")
                    }} 
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Сбросить фильтры
                  </Button>
                )}
              </div>
              {isDoctor() && (
                <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                  Создать новую справку
                </Button>
              )}
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
                    <th className="py-2 px-4 border-b">Выдано</th>
                    <th 
                      className="py-2 px-4 border-b cursor-pointer hover:bg-gray-50"
                      onClick={() => requestSort('issueddate')}
                    >
                      Дата выдачи {getSortIndicator('issueddate')}
                    </th>
                    <th 
                      className="py-2 px-4 border-b cursor-pointer hover:bg-gray-50"
                      onClick={() => requestSort('type')}
                    >
                      Тип справки {getSortIndicator('type')}
                    </th>
                    <th className="py-2 px-4 border-b">Детали</th>
                    {isDoctor() && <th className="py-2 px-4 border-b">Действия</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredCertificates.length > 0 ? (
                    filteredCertificates.map((certificate) => (
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
                        {isDoctor() && (
                          <td className="py-2 px-4 border-b whitespace-nowrap">
                            {certificate.issuedby === user.userid ? (
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
                            ) : (
                              <span className="text-gray-500">Только для автора</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isDoctor() ? 6 : 5} className="py-4 text-center text-gray-500">
                        {medicalCertificates.length === 0 ? "Нет данных о справках" : "Ничего не найдено"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isDoctor() && (
          <Modal isOpen={isModalOpen} onClose={handleCancel}>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {currentCertificate ? "Редактировать справку" : "Создать новую справку"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Пациент *</label>
                  <Input
                    type="text"
                    placeholder="Поиск пациента..."
                    value={patientSearch}
                    onChange={handlePatientSearchChange}
                    className="w-full"
                  />
                  {formData.patientID && (
                    <div className="p-2 bg-gray-100 rounded">
                      Выбран: {getSelectedPatientName()}
                    </div>
                  )}
                  <div className="max-h-60 overflow-y-auto border rounded">
                    {filteredPatients.map(patient => (
                      <div 
                        key={patient.patientid}
                        className={`p-2 hover:bg-blue-50 cursor-pointer ${formData.patientID === patient.patientid.toString() ? 'bg-blue-100' : ''}`}
                        onClick={() => handleSelectPatient(patient.patientid)}
                      >
                        {patient.lastname} {patient.firstname} {patient.middlename}
                      </div>
                    ))}
                  </div>
                </div>

                <Input
                  label="Дата выдачи *"
                  name="issuedDate"
                  value={formData.issuedDate}
                  onChange={handleInputChange}
                  type="date"
                  required
                />
                <Input
                  label="Тип справки *"
                  name="certificateType"
                  value={formData.certificateType}
                  onChange={handleInputChange}
                  type="text"
                  required
                />
                <Input
                  label="Детали"
                  name="details"
                  value={formData.details}
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
                    {currentCertificate ? "Сохранить" : "Создать"}
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}

export default MedicalCertificates