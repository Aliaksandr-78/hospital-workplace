import { useEffect, useState } from "react"
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
import Button from "../../components/Button"
import Header from "../../components/Header"
import Loader from "../../components/Loader"
import Modal from "../../components/Modal"
import Input from "../../components/Input"

const ManageDiagnosis = () => {
  const [diagnoses, setDiagnoses] = useState([])
  const [medications, setMedications] = useState([])
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

  useEffect(() => {
    const fetchDiagnoses = async () => {
      try {
        setLoading(true)
        const data = await getAllDiagnoses()
        setDiagnoses(data)
      } catch (error) {
        console.error("Ошибка при загрузке диагнозов:", error)
        setError("Не удалось загрузить диагнозы. Пожалуйста, попробуйте позже.")
      } finally {
        setLoading(false)
      }
    }

    fetchDiagnoses()
  }, [])

  const fetchMedications = async (diagnosisID) => {
    try {
      setMedicationsLoading(true);
      const data = await getMedicationsByDiagnosis(diagnosisID);
      setMedications(data || []); // Устанавливаем пустой массив, если data undefined/null
    } catch (error) {
      if (error.response?.status === 404) {
        // Если лекарства не найдены (404), устанавливаем пустой массив
        setMedications([]);
      } else {
        console.error("Ошибка при загрузке лекарств:", error);
        setError("Не удалось загрузить рекомендуемые лекарства.");
      }
    } finally {
      setMedicationsLoading(false);
    }
  };

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
    // Не перезаписываем currentDiagnosis, только устанавливаем diagnosisid если нужно
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
      await deleteDiagnosisMedication(diagnosisID, medicationID);
      
      // Обновляем список лекарств в модальном окне
      const updatedMedications = medications.filter(m => m.medicationId !== medicationID);
      setMedications(updatedMedications);
      
      // Если лекарств не осталось, можно закрыть модальное окно
      if (updatedMedications.length === 0) {
        closeDetailModal();
      }
    } catch (error) {
      console.error("Ошибка при удалении связи:", error);
      setError("Не удалось удалить связь. Пожалуйста, попробуйте позже.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Управление диагнозами" />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Управление диагнозами
        </h1>

        {loading && <Loader className="flex justify-center my-8" />}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex justify-end mb-4">
          <Button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700">
            Добавить диагноз
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Код МКБ-10</th>
                <th className="py-2 px-4 border-b">Название</th>
                <th className="py-2 px-4 border-b">Действия</th>
              </tr>
            </thead>
            <tbody>
              {diagnoses.map(diagnosis => (
                <tr key={diagnosis.diagnosisid} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{diagnosis.diagnosisid}</td>
                  <td className="py-2 px-4 border-b font-mono">{diagnosis.icd10code}</td>
                  <td className="py-2 px-4 border-b">{diagnosis.name}</td>
                  <td className="py-2 px-4 border-b space-x-2">
                    <Button
                      onClick={() => openDetailModal(diagnosis)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Подробнее
                    </Button>
                    <Button
                      onClick={() => openModal(diagnosis)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Редактировать
                    </Button>
                    <Button
                      onClick={() => handleDelete(diagnosis.diagnosisid)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Модальное окно для диагноза */}
        <Modal isOpen={isModalOpen} onClose={closeModal} size="lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentDiagnosis ? "Редактировать диагноз" : "Добавить диагноз"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                value={formData.Description}
                onChange={handleInputChange}
                placeholder="Подробное описание диагноза"
                multiline
                rows={3}
              />

              <Input
                label="Характерные симптомы"
                name="Symptoms"
                value={formData.Symptoms}
                onChange={handleInputChange}
                placeholder="Основные симптомы и клинические проявления"
                multiline
                rows={3}
              />

              <Input
                label="Клинические протоколы РБ"
                name="RBClinicalGuidelines"
                value={formData.RBClinicalGuidelines}
                onChange={handleInputChange}
                placeholder="Ссылки на клинические протоколы Республики Беларусь"
                multiline
                rows={2}
              />

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Отмена
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {currentDiagnosis ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Модальное окно с подробной информацией о диагнозе */}
        <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal} size="xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Подробная информация о диагнозе
            </h2>
            
            {currentDiagnosis && (
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Код МКБ-10:</p>
                    <p className="font-mono">{currentDiagnosis.icd10code}</p>
                  </div>
                  <div>
                    <p className="font-medium">Название:</p>
                    <p>{currentDiagnosis.name}</p>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium">Описание:</p>
                  <p className="whitespace-pre-line">{currentDiagnosis.description || "Нет данных"}</p>
                </div>
                
                <div>
                  <p className="font-medium">Симптомы:</p>
                  <p className="whitespace-pre-line">{currentDiagnosis.symptoms || "Нет данных"}</p>
                </div>
                
                <div>
                  <p className="font-medium">Клинические протоколы РБ:</p>
                  <p className="whitespace-pre-line">{currentDiagnosis.rbclinicalguidelines || "Нет данных"}</p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Рекомендуемые лекарства</h3>
                <Button 
                  onClick={() => openMedicationModal(null, currentDiagnosis.diagnosisid)}
                  className="bg-green-600 hover:bg-green-700"
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
                        <th className="py-2 px-4 border-b">Название</th>
                        <th className="py-2 px-4 border-b">Рег. номер</th>
                        <th className="py-2 px-4 border-b">Уверенность</th>
                        <th className="py-2 px-4 border-b">Первая линия</th>
                        <th className="py-2 px-4 border-b">Протокол</th>
                        <th className="py-2 px-4 border-b">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medications.map(medication => (
                        <tr key={`${medication.diagnosisId}-${medication.medicationId}`} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">
                            {medication.medicationName || "Неизвестное лекарство"}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {medication.registrationNumber || "-"}
                          </td>
                          <td className="py-2 px-4 border-b">{medication.confidence}</td>
                          <td className="py-2 px-4 border-b">
                            {medication.isFirstLine ? "Да" : "Нет"}
                          </td>
                          <td className="py-2 px-4 border-b">{medication.protocolReference || "-"}</td>
                          <td className="py-2 px-4 border-b space-x-2">
                            <Button
                              onClick={() => openMedicationModal(medication, medication.diagnosisId)}
                              className="bg-blue-600 hover:bg-blue-700 text-sm"
                            >
                              Редактировать
                            </Button>
                            <Button
                              onClick={() => handleDeleteMedication(medication.diagnosisId, medication.medicationId)}
                              className="bg-red-600 hover:bg-red-700 text-sm"
                            >
                              Удалить
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 py-4">Для этого диагноза пока нет рекомендуемых лекарств</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={closeDetailModal}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Закрыть
              </Button>
            </div>
          </div>
        </Modal>

        {/* Модальное окно для добавления/редактирования лекарства */}
        <Modal isOpen={isMedicationModalOpen} onClose={closeMedicationModal} size="md">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentMedication ? "Редактировать связь" : "Добавить лекарство"}
            </h2>
            <form onSubmit={handleMedicationSubmit} className="space-y-4">
              <Input
                label="ID лекарства*"
                name="MedicationID"
                value={medicationFormData.MedicationID}
                onChange={handleMedicationInputChange}
                placeholder="Введите ID лекарства"
                required
              />

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
                <label htmlFor="IsFirstLine" className="ml-2 block text-sm text-gray-900">
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

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  onClick={closeMedicationModal}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Отмена
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {currentMedication ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default ManageDiagnosis