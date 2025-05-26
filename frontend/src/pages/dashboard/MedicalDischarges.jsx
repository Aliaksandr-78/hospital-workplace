import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { createMedicalDischarge, getAllMedicalDischarges, getMedicalDischargeById, updateMedicalDischarge, deleteMedicalDischarge } from "../../api/medicalDischargeApi"
import { getAllPatients } from "../../api/patientApi"
import { getAllRoles } from "../../api/roleApi"
import { getUserRolesByUserId } from "../../api/userRoleApi"
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentDischarge, setCurrentDischarge] = useState(null)
  const [formData, setFormData] = useState({
    patientID: "",
    dischargeDate: "",
    summary: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [patientSearch, setPatientSearch] = useState("")
  const [filteredPatients, setFilteredPatients] = useState([])
  const [userRoles, setUserRoles] = useState([])
  const [allRoles, setAllRoles] = useState([])
  const [allUsers, setAllUsers] = useState([])

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
    filterAndSortDischarges()
  }, [medicalDischarges, searchTerm, dateFilter, sortConfig])

  useEffect(() => {
    if (patients.length > 0) {
      setFilteredPatients(
        patients.filter(patient => 
          `${patient.lastname || ''} ${patient.firstname || ''} ${patient.middlename || ''}`
            .toLowerCase()
            .includes(patientSearch.toLowerCase())
        )
      )
    }
  }, [patientSearch, patients])

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dischargesData, patientsData, usersData] = await Promise.all([
        getAllMedicalDischarges(),
        getAllPatients(),
        getAllUsers(), // Загружаем всех пользователей
      ]);
      setMedicalDischarges(dischargesData);
      setPatients(patientsData);
      setAllUsers(usersData); // Сохраняем пользователей в состояние
      setFilteredPatients(patientsData);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDischarges = () => {
    try {
      let result = [...medicalDischarges]
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        result = result.filter(discharge => {
          const patient = patients.find(p => p.patientid === discharge.patientid)
          if (!patient) return false
          
          const fullName = `${patient.lastname || ''} ${patient.firstname || ''} ${patient.middlename || ''}`.toLowerCase()
          return fullName.includes(searchLower)
        })
      }
      
      if (dateFilter) {
        try {
          const filterDate = new Date(dateFilter).toDateString()
          result = result.filter(discharge => {
            try {
              const dischargeDate = new Date(discharge.dischargedate).toDateString()
              return dischargeDate === filterDate
            } catch (e) {
              console.error("Ошибка обработки даты выписки:", e)
              return false
            }
          })
        } catch (e) {
          console.error("Ошибка обработки даты фильтра:", e)
        }
      }
      
      if (sortConfig.key) {
        result.sort((a, b) => {
          try {
            let valueA, valueB
            
            if (sortConfig.key === 'patient') {
              const patientA = patients.find(p => p.patientid === a.patientid)
              const patientB = patients.find(p => p.patientid === b.patientid)
              valueA = patientA ? `${patientA.lastname || ''} ${patientA.firstname || ''} ${patientA.middlename || ''}` : ''
              valueB = patientB ? `${patientB.lastname || ''} ${patientB.firstname || ''} ${patientB.middlename || ''}` : ''
            } else if (sortConfig.key === 'doctor') {
              valueA = a.doctorid
              valueB = b.doctorid
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
      
      setFilteredDischarges(result)
    } catch (error) {
      console.error("Ошибка в filterAndSortDischarges:", error)
      setFilteredDischarges([])
    }
  }

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getDoctorFullName = (doctorId) => {
    const doctor = allUsers.find(u => u.userid === doctorId);
    if (!doctor) return "Неизвестно";
    return `${doctor.lastname || ''} ${doctor.firstname || ''} ${doctor.middlename || ''}`.trim();
  };

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
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const dischargeDate = new Date(formData.dischargeDate)
      
      if (dischargeDate < today) {
        alert('Дата выписки не может быть раньше сегодняшнего дня')
        return
      }
  
      if (!formData.patientID || !formData.dischargeDate) {
        alert('Пожалуйста, заполните все обязательные поля')
        return
      }
  
      if (!user?.userid) {
        alert('Ошибка авторизации. Пожалуйста, войдите снова.')
        return
      }
  
      const dischargeData = {
        PatientID: Number(formData.patientID),
        DoctorID: Number(user.userid),
        DischargeDate: formData.dischargeDate,
        Summary: formData.summary || null
      }
  
      if (currentDischarge) {
        await updateMedicalDischarge(currentDischarge.dischargeid, dischargeData)
      } else {
        await createMedicalDischarge(dischargeData)
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
        patientID: discharge.patientid.toString(),
        dischargeDate: new Date(discharge.dischargedate).toLocaleDateString('sv-SE'),
        summary: discharge.summary || "",
      })
      
      const patient = patients.find(p => p.patientid === discharge.patientid)
      if (patient) {
        setPatientSearch(`${patient.lastname} ${patient.firstname} ${patient.middlename}`)
      }
      
      setIsModalOpen(true)
    } catch (error) {
      console.error("Ошибка при загрузке выписки:", error)
    }
  }

  const handleDelete = async (dischargeID) => {
    try {
      // Проверка что врач удаляет свою выписку
      const discharge = medicalDischarges.find(d => d.dischargeid === dischargeID)
      if (discharge?.doctorid !== user?.userid) {
        alert('Вы можете удалять только свои выписки')
        return
      }
      
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
      patientID: "",
      dischargeDate: "",
      summary: "",
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
      <Header appName="Управление медицинскими выписками" />

      <div className="container mx-auto p-3 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Управление медицинскими выписками</h1>

        {loading ? (
          <Loader className="flex justify-center my-6 sm:my-8" />
        ) : (
          <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <Input
                  type="text"
                  placeholder="Поиск по пациенту..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full sm:w-48 md:w-64"
                />
                <Input
                  type="date"
                  placeholder="Фильтр по дате..."
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  className="w-full sm:w-48"
                />
                {(searchTerm || dateFilter) && (
                  <Button 
                    onClick={() => {
                      setSearchTerm("")
                      setDateFilter("")
                    }} 
                    className="bg-gray-600 hover:bg-gray-700 text-sm sm:text-base"
                  >
                    Сбросить фильтры
                  </Button>
                )}
              </div>
              {isDoctor() && (
                <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-sm sm:text-base">
                  Создать новую выписку
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th 
                      className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm cursor-pointer hover:bg-gray-50"
                      onClick={() => requestSort('patient')}
                    >
                      Пациент {getSortIndicator('patient')}
                    </th>
                    <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Врач</th>
                    <th 
                      className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm cursor-pointer hover:bg-gray-50"
                      onClick={() => requestSort('dischargedate')}
                    >
                      Дата выписки {getSortIndicator('dischargedate')}
                    </th>
                    <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Заключение</th>
                    {isDoctor() && <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Действия</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredDischarges.length > 0 ? (
                    filteredDischarges.map((discharge) => (
                      <tr key={discharge.dischargeid} className="hover:bg-gray-50">
                        <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">
                          {patients.find((p) => p.patientid === discharge.patientid)?.lastname}{" "}
                          {patients.find((p) => p.patientid === discharge.patientid)?.firstname}{" "}
                          {patients.find((p) => p.patientid === discharge.patientid)?.middlename}
                        </td>
                        <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">
                          {getDoctorFullName(discharge.doctorid)}
                        </td>
                        <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{new Date(discharge.dischargedate).toLocaleDateString()}</td>
                        <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{discharge.summary}</td>
                        {isDoctor() && (
                          <td className="py-2 px-2 sm:px-4 border-b">
                            {discharge.doctorid === user.userid ? (
                              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                <Button 
                                  onClick={() => handleEdit(discharge.dischargeid)} 
                                  className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                                >
                                  Редактировать
                                </Button>
                                <Button 
                                  onClick={() => handleDelete(discharge.dischargeid)} 
                                  className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                                >
                                  Удалить
                                </Button>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-xs sm:text-sm">Только для автора</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isDoctor() ? 5 : 4} className="py-4 text-center text-xs sm:text-sm text-gray-500">
                        {medicalDischarges.length === 0 ? "Нет данных о выписках" : "Ничего не найдено"}
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
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                {currentDischarge ? "Редактировать выписку" : "Создать новую выписку"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm sm:text-base font-medium text-gray-700">Пациент *</label>
                  <Input
                    type="text"
                    placeholder="Поиск пациента..."
                    value={patientSearch}
                    onChange={handlePatientSearchChange}
                    className="w-full"
                  />
                  {formData.patientID && (
                    <div className="p-2 bg-gray-100 rounded text-sm sm:text-base">
                      Выбран: {getSelectedPatientName()}
                    </div>
                  )}
                  <div className="max-h-60 overflow-y-auto border rounded text-sm sm:text-base">
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

                <div className="space-y-2">
                  <label className="block text-sm sm:text-base font-medium text-gray-700">Врач</label>
                  <div className="p-2 bg-gray-100 rounded text-sm sm:text-base">
                    {user?.lastname} {user?.firstname} {user?.middlename}
                  </div>
                </div>

                <Input
                  label="Дата выписки *"
                  name="dischargeDate"
                  value={formData.dischargeDate}
                  onChange={handleInputChange}
                  type="date"
                  required
                />
                <Input
                  label="Заключение"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  type="textarea"
                />
                <div className="flex justify-end gap-3 sm:gap-4">
                  <Button 
                    type="button" 
                    onClick={handleCancel} 
                    className="bg-gray-600 hover:bg-gray-700 text-sm sm:text-base"
                  >
                    Отмена
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700 text-sm sm:text-base"
                  >
                    {currentDischarge ? "Сохранить" : "Создать"}
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

export default MedicalDischarges