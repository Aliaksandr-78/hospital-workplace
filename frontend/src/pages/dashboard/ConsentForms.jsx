import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { createConsentForm, getAllConsentForms, deleteConsentForm } from "../../api/consentFormApi"
import { getAllPatients } from "../../api/patientApi"
import Button from "../../components/Button"
import Header from "../../components/Header"
import Loader from "../../components/Loader"
import Input from "../../components/Input"
import Modal from "../../components/Modal"

const ConsentForms = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [consentForms, setConsentForms] = useState([])
  const [filteredConsentForms, setFilteredConsentForms] = useState([])
  const [patients, setPatients] = useState([])
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    patientid: "",
    procedure: "",
    date: "",
    details: "",
  })

  // Состояния для поиска и сортировки
  const [patientSearch, setPatientSearch] = useState("")
  const [procedureSearch, setProcedureSearch] = useState("")
  const [dateSearch, setDateSearch] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [patientSearchModal, setPatientSearchModal] = useState("")
  const [filteredPatients, setFilteredPatients] = useState([])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  useEffect(() => {
    filterAndSortConsentForms()
  }, [consentForms, patientSearch, procedureSearch, dateSearch, sortConfig])

  useEffect(() => {
    if (patients.length > 0) {
      setFilteredPatients(
        patients.filter(patient => 
          `${patient.lastname} ${patient.firstname} ${patient.middlename}`
            .toLowerCase()
            .includes(patientSearchModal.toLowerCase())
        )
      )
    }
  }, [patientSearchModal, patients])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [consentFormsData, patientsData] = await Promise.all([
        getAllConsentForms(),
        getAllPatients(),
      ])
      setConsentForms(consentFormsData)
      setPatients(patientsData)
      setFilteredPatients(patientsData)
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error)
      setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.")
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortConsentForms = () => {
    let result = [...consentForms]
    
    // Фильтрация по пациенту
    if (patientSearch) {
      const searchLower = patientSearch.toLowerCase()
      result = result.filter(consentForm => {
        const patient = patients.find(p => p.patientid === consentForm.patientid)
        if (!patient) return false
        return (
          patient.lastname.toLowerCase().includes(searchLower) ||
          patient.firstname.toLowerCase().includes(searchLower) ||
          patient.middlename?.toLowerCase().includes(searchLower)
      )})
    }
    
    // Фильтрация по процедуре
    if (procedureSearch) {
      const searchLower = procedureSearch.toLowerCase()
      result = result.filter(consentForm => 
        consentForm.procedure.toLowerCase().includes(searchLower))
    }
    
    // Фильтрация по дате
    if (dateSearch) {
      const searchDate = new Date(dateSearch).toISOString().split('T')[0]
      result = result.filter(consentForm => 
        consentForm.date.includes(searchDate))
    }
    
    // Сортировка
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valueA, valueB
        
        if (sortConfig.key === 'patient') {
          const patientA = patients.find(p => p.patientid === a.patientid)
          const patientB = patients.find(p => p.patientid === b.patientid)
          valueA = patientA ? `${patientA.lastname} ${patientA.firstname} ${patientA.middlename || ''}` : ''
          valueB = patientB ? `${patientB.lastname} ${patientB.firstname} ${patientB.middlename || ''}` : ''
        } else if (sortConfig.key === 'procedure') {
          valueA = a.procedure
          valueB = b.procedure
        } else if (sortConfig.key === 'date') {
          valueA = new Date(a.date)
          valueB = new Date(b.date)
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
    
    setFilteredConsentForms(result)
  }

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handlePatientSearchChange = (e) => {
    setPatientSearch(e.target.value)
  }

  const handleProcedureSearchChange = (e) => {
    setProcedureSearch(e.target.value)
  }

  const handleDateSearchChange = (e) => {
    setDateSearch(e.target.value)
  }

  const handlePatientSearchModalChange = (e) => {
    setPatientSearchModal(e.target.value)
  }

  const handleSelectPatient = (patientId) => {
    setFormData({ ...formData, patientid: patientId })
    setPatientSearchModal("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!formData.patientid || !formData.procedure || !formData.date) {
        setError("Все обязательные поля должны быть заполнены")
        return
      }

      await createConsentForm(formData)
      setIsModalOpen(false)
      fetchData()
      setError("")
    } catch (error) {
      console.error("Ошибка при сохранении согласия:", error)
      setError("Не удалось сохранить согласие. Пожалуйста, попробуйте позже.")
    }
  }

  const handleDelete = async (consentFormID) => {
    try {
      await deleteConsentForm(consentFormID)
      fetchData()
    } catch (error) {
      console.error("Ошибка при удалении согласия:", error)
      setError("Не удалось удалить согласие. Пожалуйста, попробуйте позже.")
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setFormData({
      patientid: "",
      procedure: "",
      date: "",
      details: "",
    })
    setPatientSearchModal("")
    setError("")
  }

  const resetFilters = () => {
    setPatientSearch("")
    setProcedureSearch("")
    setDateSearch("")
  }

  const getSelectedPatientName = () => {
    if (!formData.patientid) return ""
    const patient = patients.find(p => p.patientid === formData.patientid)
    return patient ? `${patient.lastname} ${patient.firstname} ${patient.middlename || ''}` : ""
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Управление согласиями" />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Управление согласиями</h1>

        {loading && <Loader className="flex justify-center my-8" />}

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex justify-between mb-4 flex-wrap gap-4">
          <div className="flex space-x-4 flex-wrap">
            <Input
              type="text"
              placeholder="Поиск по пациенту..."
              value={patientSearch}
              onChange={handlePatientSearchChange}
              className="w-64"
            />
            <Input
              type="text"
              placeholder="Поиск по процедуре..."
              value={procedureSearch}
              onChange={handleProcedureSearchChange}
            />
            <Input
              type="date"
              placeholder="Фильтр по дате..."
              value={dateSearch}
              onChange={handleDateSearchChange}
            />
            {(patientSearch || procedureSearch || dateSearch) && (
              <Button 
                onClick={resetFilters}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Сбросить фильтры
              </Button>
            )}
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-green-600 hover:bg-green-700"
          >
            Создать новое согласие
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
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
                    onClick={() => requestSort('procedure')}
                  >
                    Процедура {getSortIndicator('procedure')}
                  </th>
                  <th 
                    className="py-2 px-4 border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort('date')}
                  >
                    Дата {getSortIndicator('date')}
                  </th>
                  <th className="py-2 px-4 border-b">Детали</th>
                  <th className="py-2 px-4 border-b">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsentForms.length > 0 ? (
                  filteredConsentForms.map((consentForm) => {
                    const patient = patients.find(p => p.patientid === consentForm.patientid)
                    return (
                      <tr key={consentForm.consentformid} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">
                          {patient ? `${patient.lastname} ${patient.firstname} ${patient.middlename || ''}` : 'Неизвестный пациент'}
                        </td>
                        <td className="py-2 px-4 border-b">{consentForm.procedure}</td>
                        <td className="py-2 px-4 border-b">
                          {new Date(consentForm.date).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4 border-b">{consentForm.details}</td>
                        <td className="py-2 px-4 border-b">
                          <Button
                            onClick={() => handleDelete(consentForm.consentformid)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Удалить
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-500">
                      {consentForms.length === 0 ? "Нет данных о согласиях" : "Ничего не найдено"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={handleCancel}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Создать новое согласие</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Пациент *</label>
                <Input
                  type="text"
                  placeholder="Поиск пациента..."
                  value={patientSearchModal}
                  onChange={handlePatientSearchModalChange}
                  className="w-full"
                />
                {formData.patientid && (
                  <div className="p-2 bg-gray-100 rounded">
                    Выбран: {getSelectedPatientName()}
                  </div>
                )}
                <div className="max-h-60 overflow-y-auto border rounded">
                  {filteredPatients.map(patient => (
                    <div 
                      key={patient.patientid}
                      className={`p-2 hover:bg-blue-50 cursor-pointer ${formData.patientid === patient.patientid ? 'bg-blue-100' : ''}`}
                      onClick={() => handleSelectPatient(patient.patientid)}
                    >
                      {patient.lastname} {patient.firstname} {patient.middlename || ''}
                    </div>
                  ))}
                </div>
              </div>

              <Input
                label="Процедура *"
                name="procedure"
                value={formData.procedure}
                onChange={handleInputChange}
                type="text"
                required
              />
              <Input
                label="Дата *"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                type="date"
                required
              />
              <Input
                label="Детали"
                name="details"
                value={formData.details}
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
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
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

export default ConsentForms