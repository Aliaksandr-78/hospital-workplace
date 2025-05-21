import { useEffect, useState } from "react"
import PropTypes from "prop-types"
import {
  getAllDiagnoses,
  createDiagnosis,
  updateDiagnosis,
  deleteDiagnosis,
} from "../../api/diagnosisApi"
import {
  getMedicationsByDiagnosis,
  createDiagnosisMedication,
  updateDiagnosisMedication,
  deleteDiagnosisMedication,
} from "../../api/diagnosisMedicationApi"
import { getAllMedications } from "../../api/medicationApi"
import Button from "../../components/Button"
import Header from "../../components/Header"
import Loader from "../../components/Loader"
import Modal from "../../components/Modal"
import Input from "../../components/Input"

const ManageDiagnosis = () => {
  const [diagnoses, setDiagnoses] = useState([])
  const [filteredDiagnoses, setFilteredDiagnoses] = useState([])
  const [medications, setMedications] = useState([])
  const [allMedications, setAllMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [medicationsLoading, setMedicationsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isModalOpen, setModalOpen] = useState(false)
  const [isDetailModalOpen, setDetailModalOpen] = useState(false)
  const [isMedicationModalOpen, setMedicationModalOpen] = useState(false)
  const [currentDiagnosis, setCurrentDiagnosis] = useState(null)
  const [currentMedication, setCurrentMedication] = useState(null)
  const [formData, setFormData] = useState({
    ICD10Code: "",
    Name: "",
    Description: "",
    Symptoms: "",
    RBClinicalGuidelines: ""
  })
  const [medicationFormData, setMedicationFormData] = useState({
    MedicationID: "",
    Confidence: 0.9,
    IsFirstLine: false,
    ProtocolReference: ""
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [medicationSearch, setMedicationSearch] = useState("")
  const [filteredMedicationsList, setFilteredMedicationsList] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [diagnosesData, medicationsData] = await Promise.all([
          getAllDiagnoses(),
          getAllMedications()
        ])
        setDiagnoses(diagnosesData)
        setFilteredDiagnoses(diagnosesData)
        setAllMedications(medicationsData)
        setFilteredMedicationsList(medicationsData)
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error)
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    filterAndSortDiagnoses()
  }, [diagnoses, searchTerm, sortConfig])

  useEffect(() => {
    if (allMedications.length > 0) {
      setFilteredMedicationsList(
        allMedications.filter(med => 
          med.name.toLowerCase().includes(medicationSearch.toLowerCase()) ||
          med.rbregistrationnumber?.toLowerCase().includes(medicationSearch.toLowerCase())
        )
      )
    }
  }, [medicationSearch, allMedications])

  const filterAndSortDiagnoses = () => {
    let result = [...diagnoses]
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(diagnosis => 
        diagnosis.name.toLowerCase().includes(searchLower) ||
        diagnosis.icd10code.toLowerCase().includes(searchLower))
    }
    
    if (sortConfig.key) {
      result.sort((a, b) => {
        const valueA = a[sortConfig.key]
        const valueB = b[sortConfig.key]
        
        if (valueA < valueB) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    
    setFilteredDiagnoses(result)
  }

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const SortIndicator = ({ field }) => {
    if (sortConfig.key !== field) return null
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  SortIndicator.propTypes = {
    field: PropTypes.string.isRequired
  }

  const fetchMedications = async (diagnosisID) => {
    try {
      setMedicationsLoading(true)
      const data = await getMedicationsByDiagnosis(diagnosisID)
      setMedications(data || [])
    } catch (error) {
      if (error.response?.status === 404) {
        setMedications([])
      } else {
        console.error("Ошибка при загрузке лекарств:", error)
        setError("Не удалось загрузить рекомендуемые лекарства.")
      }
    } finally {
      setMedicationsLoading(false)
    }
  }

  const openModal = (diagnosis = null) => {
    setCurrentDiagnosis(diagnosis)
    setFormData(
      diagnosis
        ? {
            ICD10Code: diagnosis.icd10code || "",
            Name: diagnosis.name || "",
            Description: diagnosis.description || "",
            Symptoms: diagnosis.symptoms || "",
            RBClinicalGuidelines: diagnosis.rbclinicalguidelines || ""
          }
        : {
            ICD10Code: "",
            Name: "",
            Description: "",
            Symptoms: "",
            RBClinicalGuidelines: ""
          }
    )
    setModalOpen(true)
  }

  const openDetailModal = async (diagnosis) => {
    setCurrentDiagnosis(diagnosis)
    await fetchMedications(diagnosis.diagnosisid)
    setDetailModalOpen(true)
  }

  const openMedicationModal = (medication = null, diagnosisID) => {
    setCurrentMedication(medication)
    if (!currentDiagnosis || currentDiagnosis.diagnosisid !== diagnosisID) {
      setCurrentDiagnosis({ diagnosisid: diagnosisID })
    }
    setMedicationFormData(
      medication
        ? {
            MedicationID: medication.medicationid || "",
            Confidence: medication.confidence || 0.9,
            IsFirstLine: medication.isfirstline || false,
            ProtocolReference: medication.protocolreference || ""
          }
        : {
            MedicationID: "",
            Confidence: 0.9,
            IsFirstLine: false,
            ProtocolReference: ""
          }
    )
    setMedicationSearch(medication ? 
      allMedications.find(m => m.medicationid === medication.medicationid)?.name || "" 
      : "")
    setMedicationModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setCurrentDiagnosis(null)
    setFormData({
      ICD10Code: "",
      Name: "",
      Description: "",
      Symptoms: "",
      RBClinicalGuidelines: ""
    })
  }

  const closeDetailModal = () => {
    setDetailModalOpen(false)
    setCurrentDiagnosis(null)
    setMedications([])
  }

  const closeMedicationModal = () => {
    setMedicationModalOpen(false)
    setCurrentMedication(null)
    setMedicationFormData({
      MedicationID: "",
      Confidence: 0.9,
      IsFirstLine: false,
      ProtocolReference: ""
    })
    setMedicationSearch("")
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleMedicationInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setMedicationFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleMedicationSearchChange = (e) => {
    setMedicationSearch(e.target.value)
  }

  const handleSelectMedication = (medicationId) => {
    setMedicationFormData(prev => ({
      ...prev,
      MedicationID: medicationId
    }))
    const selectedMed = allMedications.find(m => m.medicationid === medicationId)
    if (selectedMed) {
      setMedicationSearch(selectedMed.name)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const diagnosisData = {
      ICD10Code: formData.ICD10Code,
      Name: formData.Name,
      Description: formData.Description,
      Symptoms: formData.Symptoms,
      RBClinicalGuidelines: formData.RBClinicalGuidelines
    }

    try {
      if (currentDiagnosis) {
        const updatedDiagnosis = await updateDiagnosis(currentDiagnosis.diagnosisid, diagnosisData)
        setDiagnoses(prev =>
          prev.map(diagnosis =>
            diagnosis.diagnosisid === updatedDiagnosis.diagnosisid ? updatedDiagnosis : diagnosis
          )
        )
      } else {
        const newDiagnosis = await createDiagnosis(diagnosisData)
        setDiagnoses(prev => [...prev, newDiagnosis])
      }
      closeModal()
    } catch (error) {
      console.error("Ошибка при сохранении диагноза:", error)
      setError("Не удалось сохранить диагноз. Пожалуйста, попробуйте позже.")
    }
  }

  const handleMedicationSubmit = async (e) => {
    e.preventDefault()
    if (!medicationFormData.MedicationID) {
      setError("Пожалуйста, выберите лекарство")
      return
    }

    const medicationData = {
      MedicationID: medicationFormData.MedicationID,
      Confidence: parseFloat(medicationFormData.Confidence),
      IsFirstLine: medicationFormData.IsFirstLine,
      ProtocolReference: medicationFormData.ProtocolReference
    }

    try {
      if (currentMedication) {
        await updateDiagnosisMedication(
          currentDiagnosis.diagnosisid,
          currentMedication.medicationid,
          medicationData
        )
      } else {
        await createDiagnosisMedication({
          DiagnosisID: currentDiagnosis.diagnosisid,
          ...medicationData
        })
      }
      await fetchMedications(currentDiagnosis.diagnosisid)
      closeMedicationModal()
    } catch (error) {
      console.error("Ошибка при сохранении связи:", error)
      setError("Не удалось сохранить связь диагноз-лекарство.")
    }
  }

  const handleDelete = async (diagnosisID) => {
    try {
      await deleteDiagnosis(diagnosisID)
      setDiagnoses(prev => prev.filter(diagnosis => diagnosis.diagnosisid !== diagnosisID))
    } catch (error) {
      console.error("Ошибка при удалении диагноза:", error)
      setError("Не удалось удалить диагноз. Пожалуйста, попробуйте позже.")
    }
  }

  const handleDeleteMedication = async (diagnosisID, medicationID) => {
    try {
      setMedicationsLoading(true);
      
      // Удаляем связь на сервере
      await deleteDiagnosisMedication(diagnosisID, medicationID);
      
      // Обновляем данные с сервера
      await fetchMedications(diagnosisID);
      
      setError(""); // Очищаем ошибки
      
      // Если это было последнее лекарство, закрываем модальное окно
      if (medications.length <= 1) {
        closeDetailModal();
      }
    } catch (error) {
      console.error("Ошибка при удалении связи:", error);
      setError(error.response?.data?.message || "Не удалось удалить связь");
    } finally {
      setMedicationsLoading(false);
    }
  };

  const getSelectedMedicationName = () => {
    if (!medicationFormData.MedicationID) return null
    const med = allMedications.find(m => m.medicationid === medicationFormData.MedicationID)
    return med ? med.name : null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Управление диагнозами" />

      <div className="container mx-auto p-3 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
          Управление диагнозами
        </h1>

        {loading && <Loader className="flex justify-center my-6 sm:my-8" />}
        {error && <p className="text-red-500 text-center mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>}

        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
          <Input
            type="text"
            placeholder="Поиск по названию или коду"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full sm:w-64"
          />
          <Button 
            onClick={() => openModal()} 
            className="bg-green-600 hover:bg-green-700 text-sm sm:text-base"
          >
            Добавить диагноз
          </Button>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th 
                  className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm cursor-pointer" 
                  onClick={() => requestSort("diagnosisid")}
                >
                  ID <SortIndicator field="diagnosisid" />
                </th>
                <th 
                  className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm cursor-pointer" 
                  onClick={() => requestSort("icd10code")}
                >
                  Код МКБ-10 <SortIndicator field="icd10code" />
                </th>
                <th 
                  className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm cursor-pointer" 
                  onClick={() => requestSort("name")}
                >
                  Название <SortIndicator field="name" />
                </th>
                <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredDiagnoses.length > 0 ? (
                filteredDiagnoses.map(diagnosis => (
                  <tr key={diagnosis.diagnosisid} className="hover:bg-gray-50">
                    <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{diagnosis.diagnosisid}</td>
                    <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm font-mono">{diagnosis.icd10code}</td>
                    <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{diagnosis.name}</td>
                    <td className="py-2 px-2 sm:px-4 border-b">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <Button
                          onClick={() => openDetailModal(diagnosis)}
                          className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                        >
                          Подробнее
                        </Button>
                        <Button
                          onClick={() => openModal(diagnosis)}
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          Редактировать
                        </Button>
                        <Button
                          onClick={() => handleDelete(diagnosis.diagnosisid)}
                          className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                        >
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-xs sm:text-sm text-gray-500">
                    Диагнозы не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isModalOpen} onClose={closeModal} size="lg">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              {currentDiagnosis ? "Редактировать диагноз" : "Добавить диагноз"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  label="Код МКБ-10*"
                  name="ICD10Code"
                  value={formData.ICD10Code}
                  onChange={handleInputChange}
                  placeholder="Например: J18.9"
                  required
                />
                <Input
                  label="Название диагноза*"
                  name="Name"
                  value={formData.Name}
                  onChange={handleInputChange}
                  placeholder="Официальное название согласно МКБ-10 РБ"
                  required
                />
              </div>

              <Input
                label="Описание диагноза"
                name="Description"
                type="textarea"
                value={formData.Description}
                onChange={handleInputChange}
                placeholder="Подробное описание диагноза"
              />

              <Input
                label="Характерные симптомы"
                name="Symptoms"
                type="textarea"
                value={formData.Symptoms}
                onChange={handleInputChange}
                placeholder="Основные симптомы и клинические проявления"
              />

              <Input
                label="Клинические протоколы РБ"
                name="RBClinicalGuidelines"
                type="textarea"
                value={formData.RBClinicalGuidelines}
                onChange={handleInputChange}
                placeholder="Ссылки на клинические протоколы Республики Беларусь"
              />

              <div className="flex justify-end gap-3 sm:gap-4 pt-4">
                <Button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-600 hover:bg-gray-700 text-sm sm:text-base"
                >
                  Отмена
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-sm sm:text-base">
                  {currentDiagnosis ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal} size="xl">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Подробная информация о диагнозе
            </h2>
            
            {currentDiagnosis && (
              <div className="space-y-3 sm:space-y-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="font-medium text-sm sm:text-base">Код МКБ-10:</p>
                    <p className="font-mono text-sm sm:text-base">{currentDiagnosis.icd10code}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Название:</p>
                    <p className="text-sm sm:text-base">{currentDiagnosis.name}</p>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-sm sm:text-base">Описание:</p>
                  <p className="whitespace-pre-line text-sm sm:text-base">{currentDiagnosis.description || "Нет данных"}</p>
                </div>
                
                <div>
                  <p className="font-medium text-sm sm:text-base">Симптомы:</p>
                  <p className="whitespace-pre-line text-sm sm:text-base">{currentDiagnosis.symptoms || "Нет данных"}</p>
                </div>
                
                <div>
                  <p className="font-medium text-sm sm:text-base">Клинические протоколы РБ:</p>
                  <p className="whitespace-pre-line text-sm sm:text-base">{currentDiagnosis.rbclinicalguidelines || "Нет данных"}</p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-3 sm:mb-4 gap-3">
                <h3 className="text-base sm:text-lg font-semibold">Рекомендуемые лекарства</h3>
                <Button 
                  onClick={() => openMedicationModal(null, currentDiagnosis.diagnosisid)}
                  className="bg-green-600 hover:bg-green-700 text-sm sm:text-base"
                >
                  Добавить лекарство
                </Button>
              </div>

              {medicationsLoading ? (
                <Loader className="flex justify-center my-4" />
              ) : medications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr>
                        <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Название</th>
                        <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Рег. номер</th>
                        <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Уверенность</th>
                        <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Первая линия</th>
                        <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Протокол</th>
                        <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medications.map(medication => (
                        <tr key={`${medication.diagnosisId}-${medication.medicationId}`} className="hover:bg-gray-50">
                          <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">
                            {medication.medicationName || "Неизвестное лекарство"}
                          </td>
                          <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">
                            {medication.registrationNumber || "-"}
                          </td>
                          <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{medication.confidence}</td>
                          <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">
                            {medication.isFirstLine ? "Да" : "Нет"}
                          </td>
                          <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{medication.protocolReference || "-"}</td>
                          <td className="py-2 px-2 sm:px-4 border-b">
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                              <Button
                                onClick={() => openMedicationModal(medication, medication.diagnosisId)}
                                className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                              >
                                Редактировать
                              </Button>
                              <Button
                                onClick={() => handleDeleteMedication(medication.diagnosisId, medication.medicationId)}
                                className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
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
              ) : (
                <p className="text-gray-500 text-sm sm:text-base py-4">Для этого диагноза пока нет рекомендуемых лекарств</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={closeDetailModal}
                className="bg-gray-600 hover:bg-gray-700 text-sm sm:text-base"
              >
                Закрыть
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={isMedicationModalOpen} onClose={closeMedicationModal} size="md">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              {currentMedication ? "Редактировать связь" : "Добавить лекарство"}
            </h2>
            <form onSubmit={handleMedicationSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <label className="block text-sm sm:text-base font-medium text-gray-700">Лекарство*</label>
                <Input
                  type="text"
                  placeholder="Поиск лекарства..."
                  value={medicationSearch}
                  onChange={handleMedicationSearchChange}
                  className="w-full"
                />
                {medicationFormData.MedicationID && (
                  <div className="p-2 bg-gray-100 rounded text-sm sm:text-base">
                    Выбрано: {getSelectedMedicationName()}
                  </div>
                )}
                <div className="max-h-60 overflow-y-auto border rounded text-sm sm:text-base">
                  {filteredMedicationsList.map(medication => (
                    <div 
                      key={medication.medicationid}
                      className={`p-2 hover:bg-blue-50 cursor-pointer ${medicationFormData.MedicationID === medication.medicationid ? 'bg-blue-100' : ''}`}
                      onClick={() => handleSelectMedication(medication.medicationid)}
                    >
                      {medication.name} ({medication.rbregistrationnumber || "нет рег. номера"})
                    </div>
                  ))}
                </div>
              </div>

              <Input
                label="Уверенность (0-1)*"
                name="Confidence"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={medicationFormData.Confidence}
                onChange={handleMedicationInputChange}
                required
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="IsFirstLine"
                  checked={medicationFormData.IsFirstLine}
                  onChange={handleMedicationInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="IsFirstLine" className="ml-2 block text-sm sm:text-base text-gray-900">
                  Препарат первой линии
                </label>
              </div>

              <Input
                label="Ссылка на протокол"
                name="ProtocolReference"
                value={medicationFormData.ProtocolReference}
                onChange={handleMedicationInputChange}
                placeholder="Номер приказа/протокола МЗ РБ"
              />

              <div className="flex justify-end gap-3 sm:gap-4 pt-4">
                <Button
                  type="button"
                  onClick={closeMedicationModal}
                  className="bg-gray-600 hover:bg-gray-700 text-sm sm:text-base"
                >
                  Отмена
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-sm sm:text-base">
                  {currentMedication ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default ManageDiagnosis