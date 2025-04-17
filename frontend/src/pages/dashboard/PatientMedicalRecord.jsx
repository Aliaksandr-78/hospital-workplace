import { useEffect, useState, useCallback } from "react";
import PropTypes from 'prop-types';
import {
  getMedicalRecordById,
  getMedicalRecordEntriesByRecordId,
  createMedicalRecordEntry,
  updateMedicalRecordEntry,
  deleteMedicalRecordEntry,
} from "../../api/medicalRecordEntryApi";
import {
  getFeaturesByPatient,
  createPatientFeature,
  updatePatientFeature,
  deletePatientFeature,
  toggleFeatureStatus,
} from "../../api/patientFeaturesApi";
import {
  getLabTestResultsByPatient,
  createLabTestResult,
  updateLabTestResult,
  deleteLabTestResult,
} from "../../api/labTestResultApi";
import {
  createPrescription,
} from "../../api/prescriptionApi";
import { createEntryPrescription } from "../../api/recordEntryPrescriptionsApi";
import { getMedicationRecommendations } from "../../api/aiApi";
import { getAllSpecialties } from "../../api/specialtyApi";
import { getAllLabTests } from "../../api/labTestCatalogApi";
import { getUserById } from "../../api/userApi";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Select from "../../components/Select";

const PatientMedicalRecord = ({ recordId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [patientFeatures, setPatientFeatures] = useState([]);
  const [entries, setEntries] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [labTestCatalog, setLabTestCatalog] = useState([]);
  // Состояния для выбранных элементов
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedLabTest, setSelectedLabTest] = useState(null);

  // Состояния для модальных окон
  const [isFeatureModalOpen, setFeatureModalOpen] = useState(false);
  const [isEntryModalOpen, setEntryModalOpen] = useState(false);
  const [isLabTestModalOpen, setLabTestModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [isRecommendationsModalOpen, setRecommendationsModalOpen] = useState(false);

  // Состояния для форм
  const [featureForm, setFeatureForm] = useState({
    FeatureType: "",
    FeatureValue: "",
    DateIdentified: "",
    IsActive: true,
  });
  const [entryForm, setEntryForm] = useState({
    EntryType: "consultation",
    Content: "",
    DiagnosisID: "",
  });
  const [labTestForm, setLabTestForm] = useState({
    TestID: "",
    OrderedBy: "",
    ResultValue: "",
    ReferenceRange: "",
    Interpretation: "",
    Status: "ordered",
  });
  const [prescriptionForm, setPrescriptionForm] = useState({
    MedicationID: "",
    Dosage: "",
    Instructions: "",
    IsAIRecommended: false,
  });

  // Состояния для рекомендаций
  const [recommendations, setRecommendations] = useState([]);
  const [tempPrescriptions, setTempPrescriptions] = useState([]);

  // Вспомогательные функции
  const [doctorsSpecialties, setDoctorsSpecialties] = useState({});

  const getDoctorSpecialty = useCallback(async (doctorId) => {
    if (doctorsSpecialties[doctorId]) {
      return doctorsSpecialties[doctorId];
    }

    try {
      const doctor = await getUserById(doctorId);
      const specialty = specialties.find(s => s.specialtyid === doctor.specialtyid);
      const specialtyName = specialty ? specialty.specialtyname : "Неизвестно";
      
      setDoctorsSpecialties(prev => ({
        ...prev,
        [doctorId]: specialtyName
      }));
      
      return specialtyName;
    } catch (error) {
      console.error("Ошибка при получении специализации врача:", error);
      return "Неизвестно";
    }
  }, [doctorsSpecialties, specialties]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const recordData = await getMedicalRecordById(recordId);
        setMedicalRecord(recordData);
        
        const featuresData = await getFeaturesByPatient(recordData.PatientID);
        setPatientFeatures(featuresData);
        
        const entriesData = await getMedicalRecordEntriesByRecordId(recordId);
        
        const entriesWithSpecialties = await Promise.all(
          entriesData.map(async entry => {
            const specialty = await getDoctorSpecialty(entry.DoctorID);
            return { ...entry, DoctorSpecialty: specialty };
          })
        );
        
        setEntries(entriesWithSpecialties);
        
        const labTestsData = await getLabTestResultsByPatient(recordData.PatientID);
        setLabTests(labTestsData);
        
        const specialtiesData = await getAllSpecialties();
        setSpecialties(specialtiesData);
        
        const labCatalogData = await getAllLabTests();
        setLabTestCatalog(labCatalogData);
        
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [recordId, getDoctorSpecialty]);

  // Обработчики для особенностей пациента
  const openFeatureModal = (feature = null) => {
    setSelectedFeature(feature);
    setFeatureForm(
      feature
        ? {
            FeatureType: feature.FeatureType,
            FeatureValue: feature.FeatureValue,
            DateIdentified: feature.DateIdentified,
            IsActive: feature.IsActive,
          }
        : {
            FeatureType: "",
            FeatureValue: "",
            DateIdentified: new Date().toISOString().split("T")[0],
            IsActive: true,
          }
    );
    setFeatureModalOpen(true);
  };

  const handleFeatureSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedFeature) {
        const updatedFeature = await updatePatientFeature(selectedFeature.FeatureID, featureForm);
        setPatientFeatures(prev =>
          prev.map(f => (f.FeatureID === updatedFeature.FeatureID ? updatedFeature : f)))
      } else {
        const newFeature = await createPatientFeature({
          PatientID: medicalRecord.PatientID,
          ...featureForm,
        })
        setPatientFeatures(prev => [...prev, newFeature]);
      }
      setFeatureModalOpen(false);
    } catch (error) {
      console.error("Ошибка при сохранении особенности:", error);
      setError("Не удалось сохранить особенность пациента.");
    }
  };

  const handleDeleteFeature = async (featureId) => {
    try {
      await deletePatientFeature(featureId);
      setPatientFeatures(prev => prev.filter(f => f.FeatureID !== featureId));
      setSelectedFeature(null);
    } catch (error) {
      console.error("Ошибка при удалении особенности:", error);
      setError("Не удалось удалить особенность пациента.");
    }
  };

  const handleToggleFeatureStatus = async (featureId) => {
    try {
      const updatedFeature = await toggleFeatureStatus(featureId);
      setPatientFeatures(prev =>
        prev.map(f => (f.FeatureID === featureId ? updatedFeature : f)))
      if (selectedFeature?.FeatureID === featureId) {
        setSelectedFeature(updatedFeature);
      }
    } catch (error) {
      console.error("Ошибка при изменении статуса особенности:", error);
      setError("Не удалось изменить статус особенности.");
    }
  };

  // Обработчики для записей в карте
  const openEntryModal = (entry = null) => {
    setSelectedEntry(entry);
    setEntryForm(
      entry
        ? {
            EntryType: entry.EntryType,
            Content: entry.Content,
            DiagnosisID: entry.DiagnosisID || "",
          }
        : {
            EntryType: "consultation",
            Content: "",
            DiagnosisID: "",
          }
    );
    setEntryModalOpen(true);
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEntry) {
        const updatedEntry = await updateMedicalRecordEntry(
          selectedEntry.EntryID,
          entryForm
        );
        setEntries(prev =>
          prev.map(e => (e.EntryID === updatedEntry.EntryID ? updatedEntry : e))
        );
        setSelectedEntry(updatedEntry);
      } else {
        const newEntry = await createMedicalRecordEntry({
          RecordID: recordId,
          DoctorID: 1, // Здесь должен быть ID текущего пользователя
          ...entryForm,
        });
        setEntries(prev => [...prev, newEntry]);
        setSelectedEntry(newEntry);
      }
      setEntryModalOpen(false);
    } catch (error) {
      console.error("Ошибка при сохранении записи:", error);
      setError("Не удалось сохранить запись в карте.");
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      await deleteMedicalRecordEntry(entryId);
      setEntries(prev => prev.filter(e => e.EntryID !== entryId));
      setSelectedEntry(null);
    } catch (error) {
      console.error("Ошибка при удалении записи:", error);
      setError("Не удалось удалить запись из карты.");
    }
  };

  // Обработчики для лабораторных тестов
  const openLabTestModal = (labTest = null) => {
    setSelectedLabTest(labTest);
    setLabTestForm(
      labTest
        ? {
            TestID: labTest.TestID,
            OrderedBy: labTest.OrderedBy,
            ResultValue: labTest.ResultValue || "",
            ReferenceRange: labTest.ReferenceRange || "",
            Interpretation: labTest.Interpretation || "",
            Status: labTest.Status || "ordered",
          }
        : {
            TestID: "",
            OrderedBy: 1, // ID текущего пользователя
            ResultValue: "",
            ReferenceRange: "",
            Interpretation: "",
            Status: "ordered",
          }
    );
    setLabTestModalOpen(true);
  };

  const handleLabTestSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedLabTest) {
        const updatedLabTest = await updateLabTestResult(
          selectedLabTest.ResultID,
          labTestForm
        );
        setLabTests(prev =>
          prev.map(t => (t.ResultID === updatedLabTest.ResultID ? updatedLabTest : t))
        );
        setSelectedLabTest(updatedLabTest);
      } else {
        const newLabTest = await createLabTestResult({
          PatientID: medicalRecord.PatientID,
          ...labTestForm,
        });
        setLabTests(prev => [...prev, newLabTest]);
        setSelectedLabTest(newLabTest);
      }
      setLabTestModalOpen(false);
    } catch (error) {
      console.error("Ошибка при сохранении лабораторного теста:", error);
      setError("Не удалось сохранить лабораторный тест.");
    }
  };

  const handleDeleteLabTest = async (resultId) => {
    try {
      await deleteLabTestResult(resultId);
      setLabTests(prev => prev.filter(t => t.ResultID !== resultId));
      setSelectedLabTest(null);
    } catch (error) {
      console.error("Ошибка при удалении лабораторного теста:", error);
      setError("Не удалось удалить лабораторный тест.");
    }
  };

  // Обработчики для назначений
  const openPrescriptionModal = () => {
    setPrescriptionForm({
      MedicationID: "",
      Dosage: "",
      Instructions: "",
      IsAIRecommended: false,
    });
    setPrescriptionModalOpen(true);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      const newPrescription = {
        ...prescriptionForm,
        PatientID: medicalRecord.PatientID,
        DoctorID: 1, // ID текущего пользователя
      };
      setTempPrescriptions(prev => [...prev, newPrescription]);
      setPrescriptionModalOpen(false);
    } catch (error) {
      console.error("Ошибка при создании назначения:", error);
      setError("Не удалось создать назначение.");
    }
  };

  const handleRemoveTempPrescription = (index) => {
    setTempPrescriptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    try {
      // Сохраняем все временные назначения
      const savedPrescriptions = await Promise.all(
        tempPrescriptions.map(p => createPrescription(p))
      );

      // Если есть выбранная запись, создаем связи
      if (selectedEntry) {
        await Promise.all(
          savedPrescriptions.map(p =>
            createEntryPrescription({
              EntryID: selectedEntry.EntryID,
              PrescriptionID: p.PrescriptionID,
            })
          )
        );
      }

      // Очищаем временные назначения
      setTempPrescriptions([]);
    } catch (error) {
      console.error("Ошибка при сохранении назначений:", error);
      setError("Не удалось сохранить назначения.");
    }
  };

  // Обработчики для рекомендаций
  const getRecommendations = async () => {
    try {
      if (!entryForm.DiagnosisID) {
        setError("Необходимо указать диагноз для получения рекомендаций");
        return;
      }
      
      const response = await getMedicationRecommendations(
        entryForm.DiagnosisID,
        medicalRecord.PatientID
      );
      setRecommendations(response.recommendations);
      setRecommendationsModalOpen(true);
    } catch (error) {
      console.error("Ошибка при получении рекомендаций:", error);
      setError("Не удалось получить рекомендации.");
    }
  };

  const addRecommendationToForm = (medication) => {
    setPrescriptionForm({
      MedicationID: medication.MedicationID,
      Dosage: medication.dosage || "",
      Instructions: medication.instructions || "",
      IsAIRecommended: true,
      AIRecommendationScore: medication.confidence,
      AIContraindicationsChecked: medication.isSafe,
    });
    setRecommendationsModalOpen(false);
    setPrescriptionModalOpen(true);
  };

  const getTestName = (testId) => {
    const test = labTestCatalog.find(t => t.TestID === testId);
    return test ? test.Name : "Неизвестный тест";
  };

  if (loading) {
    return <Loader className="flex justify-center my-8" />;
  }

  if (!medicalRecord) {
    return <div className="text-center text-red-500">Медицинская карта не найдена</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName={`Медицинская карта пациента`} />

      <div className="container mx-auto p-4 flex">
        {/* Левая панель с деревьями */}
        <div className="w-1/3 pr-4">
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h2 className="text-xl font-semibold mb-2">Особенности пациента</h2>
            <div className="max-h-60 overflow-y-auto mb-2">
              {patientFeatures.map(feature => (
                <div
                  key={feature.FeatureID}
                  className={`p-2 mb-1 cursor-pointer rounded ${selectedFeature?.featureid === feature.featureid ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedFeature(feature)}
                >
                  <div className="flex justify-between">
                    <span className={`${!feature.isactive ? 'line-through text-gray-500' : ''}`}>
                      {feature.featuretype}: {feature.featurevalue}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(feature.dateidentified).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => openFeatureModal()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Добавить особенность
            </Button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h2 className="text-xl font-semibold mb-2">Записи в карте</h2>
            <div className="max-h-60 overflow-y-auto mb-2">
              {entries
                .sort((a, b) => new Date(b.EntryDate) - new Date(a.EntryDate))
                .map(entry => (
                  <div
                    key={entry.EntryID}
                    className={`p-2 mb-1 cursor-pointer rounded ${selectedEntry?.entryid === entry.entryid ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <div className="flex justify-between">
                      <span>{new Date(entry.entrydate).toLocaleDateString()}</span>
                      <span className="text-sm text-gray-500">
                        {entry.doctorspecialty || "Неизвестно"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            <Button
              onClick={() => openEntryModal()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Создать запись
            </Button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Лабораторные тесты</h2>
            <div className="max-h-60 overflow-y-auto mb-2">
              {labTests
                .sort((a) => (a.ResultDate ? 1 : -1))
                .map(test => (
                  <div
                    key={test.ResultID}
                    className={`p-2 mb-1 cursor-pointer rounded ${selectedLabTest?.ResultID === test.ResultID ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedLabTest(test)}
                  >
                    <div className="flex justify-between">
                      <span className={!test.ResultDate ? 'font-semibold' : ''}>
                        {test.ResultDate
                          ? new Date(test.ResultDate).toLocaleDateString()
                          : new Date(test.OrderDate).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {getTestName(test.TestID)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            <Button
              onClick={() => openLabTestModal()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Создать тест
            </Button>
          </div>
        </div>

        {/* Правая панель с деталями */}
        <div className="w-2/3 pl-4">
          {error && <div className="text-red-500 mb-4">{error}</div>}

          {/* Детали выбранной особенности */}
          {selectedFeature && (
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
              <h2 className="text-xl font-semibold mb-2">Детали особенности</h2>
              <div className="mb-4">
                <p><strong>Тип:</strong> {selectedFeature.FeatureType}</p>
                <p><strong>Значение:</strong> {selectedFeature.FeatureValue}</p>
                <p><strong>Дата выявления:</strong> {new Date(selectedFeature.DateIdentified).toLocaleDateString()}</p>
                <p><strong>Статус:</strong> {selectedFeature.IsActive ? "Активно" : "Неактивно"}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => openFeatureModal(selectedFeature)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Редактировать
                </Button>
                <Button
                  onClick={() => handleToggleFeatureStatus(selectedFeature.FeatureID)}
                  className={selectedFeature.IsActive ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {selectedFeature.IsActive ? "Деактивировать" : "Активировать"}
                </Button>
                <Button
                  onClick={() => handleDeleteFeature(selectedFeature.FeatureID)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Удалить
                </Button>
              </div>
            </div>
          )}

          {/* Детали выбранной записи */}
          {selectedEntry && (
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
              <h2 className="text-xl font-semibold mb-2">Детали записи</h2>
              <div className="mb-4">
                <p><strong>Дата:</strong> {new Date(selectedEntry.EntryDate).toLocaleString()}</p>
                <p><strong>Тип:</strong> {selectedEntry.EntryType}</p>
                <p><strong>Содержание:</strong> {selectedEntry.Content}</p>
                {selectedEntry.DiagnosisID && (
                  <p><strong>Диагноз:</strong> {selectedEntry.DiagnosisID}</p>
                )}
              </div>
              <div className="flex space-x-2 mb-4">
                <Button
                  onClick={() => openEntryModal(selectedEntry)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Редактировать
                </Button>
                <Button
                  onClick={() => handleDeleteEntry(selectedEntry.EntryID)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Удалить
                </Button>
              </div>

              <h3 className="text-lg font-semibold mb-2">Назначения</h3>
              <div className="mb-4">
                {tempPrescriptions.map((prescription, index) => (
                  <div key={index} className="p-2 mb-2 bg-gray-100 rounded">
                    <p><strong>Препарат:</strong> {prescription.MedicationID}</p>
                    <p><strong>Дозировка:</strong> {prescription.Dosage}</p>
                    <p><strong>Инструкции:</strong> {prescription.Instructions}</p>
                    <Button
                      onClick={() => handleRemoveTempPrescription(index)}
                      className="mt-1 bg-red-600 hover:bg-red-700 text-sm"
                    >
                      Удалить
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={openPrescriptionModal}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Добавить назначение
                </Button>
                {tempPrescriptions.length > 0 && (
                  <Button
                    onClick={handleSaveAll}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Сохранить все
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Детали выбранного теста */}
          {selectedLabTest && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Детали теста</h2>
              <div className="mb-4">
                <p><strong>Название:</strong> {getTestName(selectedLabTest.TestID)}</p>
                <p><strong>Дата назначения:</strong> {new Date(selectedLabTest.OrderDate).toLocaleString()}</p>
                {selectedLabTest.ResultDate && (
                  <p><strong>Дата результата:</strong> {new Date(selectedLabTest.ResultDate).toLocaleString()}</p>
                )}
                <p><strong>Статус:</strong> {selectedLabTest.Status}</p>
                {selectedLabTest.ResultValue && (
                  <p><strong>Результат:</strong> {selectedLabTest.ResultValue}</p>
                )}
                {selectedLabTest.ReferenceRange && (
                  <p><strong>Референсные значения:</strong> {selectedLabTest.ReferenceRange}</p>
                )}
                {selectedLabTest.Interpretation && (
                  <p><strong>Интерпретация:</strong> {selectedLabTest.Interpretation}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => openLabTestModal(selectedLabTest)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Редактировать
                </Button>
                <Button
                  onClick={() => handleDeleteLabTest(selectedLabTest.ResultID)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Удалить
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно для особенностей пациента */}
      <Modal isOpen={isFeatureModalOpen} onClose={() => setFeatureModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedFeature ? "Редактировать особенность" : "Добавить особенность"}
          </h2>
          <form onSubmit={handleFeatureSubmit} className="space-y-4">
            <Select
              label="Тип особенности"
              name="FeatureType"
              value={featureForm.FeatureType}
              onChange={(e) => setFeatureForm({...featureForm, FeatureType: e.target.value})}
              options={[
                {value: "allergy", label: "Аллергия"},
                {value: "disease", label: "Заболевание"},
                {value: "condition", label: "Состояние"},
              ]}
              required
            />
            <Input
              label="Значение"
              name="FeatureValue"
              value={featureForm.FeatureValue}
              onChange={(e) => setFeatureForm({...featureForm, FeatureValue: e.target.value})}
              placeholder="Например: Пенициллин"
              required
            />
            <Input
              label="Дата выявления"
              name="DateIdentified"
              type="date"
              value={featureForm.DateIdentified}
              onChange={(e) => setFeatureForm({...featureForm, DateIdentified: e.target.value})}
              required
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="IsActive"
                name="IsActive"
                checked={featureForm.IsActive}
                onChange={(e) => setFeatureForm({...featureForm, IsActive: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="IsActive">Активно</label>
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                onClick={() => setFeatureModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Отмена
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {selectedFeature ? "Сохранить" : "Добавить"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Модальное окно для записей в карте */}
      <Modal isOpen={isEntryModalOpen} onClose={() => setEntryModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedEntry ? "Редактировать запись" : "Создать запись"}
          </h2>
          <form onSubmit={handleEntrySubmit} className="space-y-4">
            <Select
              label="Тип записи"
              name="EntryType"
              value={entryForm.EntryType}
              onChange={(e) => setEntryForm({...entryForm, EntryType: e.target.value})}
              options={[
                {value: "consultation", label: "Консультация"},
                {value: "examination", label: "Осмотр"},
                {value: "procedure", label: "Процедура"},
                {value: "diagnosis", label: "Диагноз"},
              ]}
              required
            />
            <Input
              label="Диагноз (код МКБ-10)"
              name="DiagnosisID"
              value={entryForm.DiagnosisID}
              onChange={(e) => setEntryForm({...entryForm, DiagnosisID: e.target.value})}
              placeholder="Например: J18.9"
            />
            <Input
              label="Содержание"
              name="Content"
              value={entryForm.Content}
              onChange={(e) => setEntryForm({...entryForm, Content: e.target.value})}
              placeholder="Подробное описание"
              multiline
              required
            />
            <div className="flex justify-between">
              <Button
                type="button"
                onClick={() => getRecommendations()}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!entryForm.DiagnosisID}
              >
                Рассчитать рекомендации
              </Button>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  onClick={() => setEntryModalOpen(false)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Отмена
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {selectedEntry ? "Сохранить" : "Создать"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* Модальное окно для лабораторных тестов */}
      <Modal isOpen={isLabTestModalOpen} onClose={() => setLabTestModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedLabTest ? "Редактировать тест" : "Создать тест"}
          </h2>
          <form onSubmit={handleLabTestSubmit} className="space-y-4">
            <Select
              label="Тест"
              name="TestID"
              value={labTestForm.TestID}
              onChange={(e) => setLabTestForm({...labTestForm, TestID: e.target.value})}
              options={labTestCatalog.map(test => ({
                value: test.TestID,
                label: test.Name,
              }))}
              required
            />
            <Select
              label="Статус"
              name="Status"
              value={labTestForm.Status}
              onChange={(e) => setLabTestForm({...labTestForm, Status: e.target.value})}
              options={[
                {value: "ordered", label: "Назначен"},
                {value: "in_progress", label: "В процессе"},
                {value: "completed", label: "Завершен"},
                {value: "cancelled", label: "Отменен"},
              ]}
              required
            />
            {labTestForm.Status === "completed" && (
              <>
                <Input
                  label="Результат"
                  name="ResultValue"
                  value={labTestForm.ResultValue}
                  onChange={(e) => setLabTestForm({...labTestForm, ResultValue: e.target.value})}
                  placeholder="Значение результата"
                  required
                />
                <Input
                  label="Референсные значения"
                  name="ReferenceRange"
                  value={labTestForm.ReferenceRange}
                  onChange={(e) => setLabTestForm({...labTestForm, ReferenceRange: e.target.value})}
                  placeholder="Нормальные значения"
                />
                <Input
                  label="Интерпретация"
                  name="Interpretation"
                  value={labTestForm.Interpretation}
                  onChange={(e) => setLabTestForm({...labTestForm, Interpretation: e.target.value})}
                  placeholder="Интерпретация результата"
                  multiline
                />
              </>
            )}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                onClick={() => setLabTestModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Отмена
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {selectedLabTest ? "Сохранить" : "Создать"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Модальное окно для назначений */}
      <Modal isOpen={isPrescriptionModalOpen} onClose={() => setPrescriptionModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Добавить назначение</h2>
          <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
            <Input
              label="ID препарата"
              name="MedicationID"
              value={prescriptionForm.MedicationID}
              onChange={(e) => setPrescriptionForm({...prescriptionForm, MedicationID: e.target.value})}
              placeholder="ID лекарственного средства"
              required
            />
            <Input
              label="Дозировка"
              name="Dosage"
              value={prescriptionForm.Dosage}
              onChange={(e) => setPrescriptionForm({...prescriptionForm, Dosage: e.target.value})}
              placeholder="Например: 500 мг 2 раза в день"
              required
            />
            <Input
              label="Инструкции"
              name="Instructions"
              value={prescriptionForm.Instructions}
              onChange={(e) => setPrescriptionForm({...prescriptionForm, Instructions: e.target.value})}
              placeholder="Дополнительные инструкции"
              multiline
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="IsAIRecommended"
                name="IsAIRecommended"
                checked={prescriptionForm.IsAIRecommended}
                onChange={(e) => setPrescriptionForm({...prescriptionForm, IsAIRecommended: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="IsAIRecommended">Рекомендовано ИИ</label>
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                onClick={() => setPrescriptionModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Отмена
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Добавить
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Модальное окно с рекомендациями */}
      <Modal isOpen={isRecommendationsModalOpen} onClose={() => setRecommendationsModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Рекомендации по лечению</h2>
          <div className="max-h-96 overflow-y-auto">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 mb-2 bg-gray-100 rounded">
                <h3 className="font-medium">{rec.name}</h3>
                <p>Уверенность: {(rec.confidence * 100).toFixed(1)}%</p>
                <p>Источник: {rec.source}</p>
                <p>Безопасность: {rec.isSafe ? "Безопасно" : "Потенциально опасно"}</p>
                {rec.contraindications && rec.contraindications.length > 0 && (
                  <p className="text-red-600">
                    Противопоказания: {rec.contraindications.join(", ")}
                  </p>
                )}
                <Button
                  onClick={() => addRecommendationToForm(rec)}
                  className="mt-2 bg-blue-600 hover:bg-blue-700"
                >
                  Использовать эту рекомендацию
                </Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => setRecommendationsModalOpen(false)}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Закрыть
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

PatientMedicalRecord.propTypes = {
  recordId: PropTypes.string.isRequired
};

export default PatientMedicalRecord;