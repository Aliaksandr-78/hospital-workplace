import { useEffect, useState, useCallback } from "react";
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types';
import {
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
import { getMedicalRecordById } from "../../api/medicalRecordApi";
import { createPrescription } from "../../api/prescriptionApi";
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

const PatientMedicalRecord = () => {
  const { recordId } = useParams();
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
    featuretype: "disease", // Установите значение по умолчанию
    featurevalue: "",
    dateidentified: new Date().toISOString().split('T')[0], // Текущая дата
    isactive: true
  });
  const [entryForm, setEntryForm] = useState({
    entrytype: "consultation",
    content: "",
    diagnosisid: "",
  });
  const [labTestForm, setLabTestForm] = useState({
    testid: "",
    orderedby: "",
    resultvalue: "",
    referencerange: "",
    interpretation: "",
    status: "ordered",
  });
  const [prescriptionForm, setPrescriptionForm] = useState({
    medicationid: "",
    dosage: "",
    instructions: "",
    isairecommended: false,
  });

  // Состояния для рекомендаций
  const [recommendations, setRecommendations] = useState([]);
  const [tempPrescriptions, setTempPrescriptions] = useState([]);

  // Вспомогательные функции
  const [doctorsSpecialties, setDoctorsSpecialties] = useState({});

  const FEATURE_TYPES = [
    { value: "Заболевание", label: "Заболевание" },
    { value: "Патологическое состояние", label: "Патологическое состояние" },
    { value: "Аллергия", label: "Аллергия" },
    { value: "Непереносимость", label: "Непереносимость" },
    { value: "Физиологическая особенность", label: "Физиологическая особенность" },
    { value: "Привычка", label: "Привычка" },
    { value: "Психологический фактор", label: "Психологический фактор" }
  ];

  const getDoctorSpecialty = useCallback(async (doctorId) => {
    if (!doctorId) return "Неизвестно";
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
  }, [doctorsSpecialties, specialties]); // Добавьте зависимости

  useEffect(() => {
    if (!recordId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const recordData = await getMedicalRecordById(recordId);
        if (!recordData?.recordid) {
          throw new Error("Медицинская карта не найдена");
        }
        
        setMedicalRecord(recordData);
        
        // Загружаем данные параллельно, где возможно
        const [featuresData, entriesData, labTestsData, specialtiesData, labCatalogData] = 
          await Promise.all([
            getFeaturesByPatient(recordData.patientid),
            getMedicalRecordEntriesByRecordId(recordId),
            getLabTestResultsByPatient(recordData.patientid),
            getAllSpecialties(),
            getAllLabTests()
          ]);

        setPatientFeatures(featuresData);
        setSpecialties(specialtiesData);
        setLabTestCatalog(labCatalogData);
        setLabTests(labTestsData);

        // Обрабатываем записи после загрузки специализаций
        const entriesWithSpecialties = await Promise.all(
          entriesData.map(async entry => ({
            ...entry,
            doctorspecialty: await getDoctorSpecialty(entry.doctorid)
          }))
        );
        
        setEntries(entriesWithSpecialties);
        
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        setError(error.message || "Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [recordId]);

  // Обработчики для особенностей пациента
  const openFeatureModal = (feature = null) => {
    setSelectedFeature(feature);
    setFeatureForm(
      feature
        ? {
            featuretype: feature.featuretype,
            featurevalue: feature.featurevalue,
            dateidentified: feature.dateidentified || new Date().toISOString().split('T')[0],
            isactive: feature.isactive
          }
        : {
            featuretype: feature?.featuretype || "disease", // Значение по умолчанию
            featurevalue: feature?.featurevalue || "",
            dateidentified: feature?.dateidentified || new Date().toISOString().split('T')[0],
            isactive: feature?.isactive !== false
          }
    );
    setError(""); // Сбрасываем ошибки
    setFeatureModalOpen(true);
  };

  const handleFeatureSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация полей
    if (!featureForm.featuretype || !featureForm.featurevalue || !featureForm.dateidentified) {
      setError("Пожалуйста, заполните все обязательные поля");
      return;
    }
  
    try {
      const featureData = {
        patientid: medicalRecord.patientid,
        featuretype: featureForm.featuretype,
        featurevalue: featureForm.featurevalue.trim(), // Удаляем лишние пробелы
        dateidentified: featureForm.dateidentified,
        isactive: featureForm.isactive
      };
  
      if (selectedFeature) {
        const updatedFeature = await updatePatientFeature(
          selectedFeature.featureid, 
          featureData
        );
        setPatientFeatures(prev =>
          prev.map(f => f.featureid === updatedFeature.featureid ? updatedFeature : f)
        );
      } else {
        const newFeature = await createPatientFeature(featureData);
        setPatientFeatures(prev => [...prev, newFeature]);
      }
      
      setFeatureModalOpen(false);
      setError("");
    } catch (error) {
      console.error("Ошибка при сохранении особенности:", error);
      setError(error.message || "Не удалось сохранить особенность");
    }
  };

  const handleDeleteFeature = async (featureId) => {
    try {
      await deletePatientFeature(featureId);
      setPatientFeatures(prev => prev.filter(f => f.featureid !== featureId));
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
        prev.map(f => (f.featureid === featureId ? updatedFeature : f)))
      if (selectedFeature?.featureid === featureId) {
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
            entrytype: entry.entrytype,
            content: entry.content,
            diagnosisid: entry.diagnosisid || "",
          }
        : {
            entrytype: "consultation",
            content: "",
            diagnosisid: "",
          }
    );
    setEntryModalOpen(true);
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEntry) {
        const updatedEntry = await updateMedicalRecordEntry(
          selectedEntry.entryid,
          entryForm
        );
        setEntries(prev =>
          prev.map(e => (e.entryid === updatedEntry.entryid ? updatedEntry : e))
        );
        setSelectedEntry(updatedEntry);
      } else {
        const newEntry = await createMedicalRecordEntry({
          recordid: recordId,
          doctorid: 1, // Здесь должен быть ID текущего пользователя
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
      setEntries(prev => prev.filter(e => e.entryid !== entryId));
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
            testid: labTest.testid,
            orderedby: labTest.orderedby,
            resultvalue: labTest.resultvalue || "",
            referencerange: labTest.referencerange || "",
            interpretation: labTest.interpretation || "",
            status: labTest.status || "ordered",
          }
        : {
            testid: "",
            orderedby: 1, // ID текущего пользователя
            resultvalue: "",
            referencerange: "",
            interpretation: "",
            status: "ordered",
          }
    );
    setLabTestModalOpen(true);
  };

  const handleLabTestSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedLabTest) {
        const updatedLabTest = await updateLabTestResult(
          selectedLabTest.resultid,
          labTestForm
        );
        setLabTests(prev =>
          prev.map(t => (t.resultid === updatedLabTest.resultid ? updatedLabTest : t))
        );
        setSelectedLabTest(updatedLabTest);
      } else {
        const newLabTest = await createLabTestResult({
          patientid: medicalRecord.patientid,
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
      setLabTests(prev => prev.filter(t => t.resultid !== resultId));
      setSelectedLabTest(null);
    } catch (error) {
      console.error("Ошибка при удалении лабораторного теста:", error);
      setError("Не удалось удалить лабораторный тест.");
    }
  };

  // Обработчики для назначений
  const openPrescriptionModal = () => {
    setPrescriptionForm({
      medicationid: "",
      dosage: "",
      instructions: "",
      isairecommended: false,
    });
    setPrescriptionModalOpen(true);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      const newPrescription = {
        ...prescriptionForm,
        patientid: medicalRecord.patientid,
        doctorid: 1, // ID текущего пользователя
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
              entryid: selectedEntry.entryid,
              prescriptionid: p.prescriptionid,
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
      if (!entryForm.diagnosisid) {
        setError("Необходимо указать диагноз для получения рекомендаций");
        return;
      }
      
      const response = await getMedicationRecommendations(
        entryForm.diagnosisid,
        medicalRecord.patientid
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
      medicationid: medication.medicationid,
      dosage: medication.dosage || "",
      instructions: medication.instructions || "",
      isairecommended: true,
      airecommendationscore: medication.confidence,
      aicontraindicationschecked: medication.isSafe,
    });
    setRecommendationsModalOpen(false);
    setPrescriptionModalOpen(true);
  };

  const getTestName = (testId) => {
    const test = labTestCatalog.find(t => t.testid === testId);
    return test ? test.name : "Неизвестный тест";
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
                  key={feature.featureid}
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
                .sort((a, b) => new Date(b.entrydate) - new Date(a.entrydate))
                .map(entry => (
                  <div
                    key={entry.entryid}
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
                .sort((a) => (a.resultdate ? 1 : -1))
                .map(test => (
                  <div
                    key={test.resultid}
                    className={`p-2 mb-1 cursor-pointer rounded ${selectedLabTest?.resultid === test.resultid ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedLabTest(test)}
                  >
                    <div className="flex justify-between">
                      <span className={!test.resultdate ? 'font-semibold' : ''}>
                        {test.resultdate
                          ? new Date(test.resultdate).toLocaleDateString()
                          : new Date(test.orderdate).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {getTestName(test.testid)}
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
                <p><strong>Тип:</strong> {selectedFeature.featuretype}</p>
                <p><strong>Значение:</strong> {selectedFeature.featurevalue}</p>
                <p><strong>Дата выявления:</strong> {new Date(selectedFeature.dateidentified).toLocaleDateString()}</p>
                <p><strong>Статус:</strong> {selectedFeature.isactive ? "Активно" : "Неактивно"}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => openFeatureModal(selectedFeature)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Редактировать
                </Button>
                <Button
                  onClick={() => handleToggleFeatureStatus(selectedFeature.featureid)}
                  className={selectedFeature.isactive ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {selectedFeature.isactive ? "Деактивировать" : "Активировать"}
                </Button>
                <Button
                  onClick={() => handleDeleteFeature(selectedFeature.featureid)}
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
                <p><strong>Дата:</strong> {new Date(selectedEntry.entrydate).toLocaleString()}</p>
                <p><strong>Тип:</strong> {selectedEntry.entrytype}</p>
                <p><strong>Содержание:</strong> {selectedEntry.content}</p>
                {selectedEntry.diagnosisid && (
                  <p><strong>Диагноз:</strong> {selectedEntry.diagnosisid}</p>
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
                  onClick={() => handleDeleteEntry(selectedEntry.entryid)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Удалить
                </Button>
              </div>

              <h3 className="text-lg font-semibold mb-2">Назначения</h3>
              <div className="mb-4">
                {tempPrescriptions.map((prescription, index) => (
                  <div key={index} className="p-2 mb-2 bg-gray-100 rounded">
                    <p><strong>Препарат:</strong> {prescription.medicationid}</p>
                    <p><strong>Дозировка:</strong> {prescription.dosage}</p>
                    <p><strong>Инструкции:</strong> {prescription.instructions}</p>
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
                <p><strong>Название:</strong> {getTestName(selectedLabTest.testid)}</p>
                <p><strong>Дата назначения:</strong> {new Date(selectedLabTest.orderdate).toLocaleString()}</p>
                {selectedLabTest.resultdate && (
                  <p><strong>Дата результата:</strong> {new Date(selectedLabTest.resultdate).toLocaleString()}</p>
                )}
                <p><strong>Статус:</strong> {selectedLabTest.status}</p>
                {selectedLabTest.resultvalue && (
                  <p><strong>Результат:</strong> {selectedLabTest.resultvalue}</p>
                )}
                {selectedLabTest.referencerange && (
                  <p><strong>Референсные значения:</strong> {selectedLabTest.referencerange}</p>
                )}
                {selectedLabTest.interpretation && (
                  <p><strong>Интерпретация:</strong> {selectedLabTest.interpretation}</p>
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
                  onClick={() => handleDeleteLabTest(selectedLabTest.resultid)}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип особенности <span className="text-red-500">*</span>
              </label>
              <Select
                label="Тип особенности"
                name="featuretype"
                value={featureForm.featuretype || "disease"} // Значение по умолчанию
                onChange={(value) => setFeatureForm({...featureForm, featuretype: value})}
                options={FEATURE_TYPES}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Значение <span className="text-red-500">*</span>
              </label>
              <Input
                name="featurevalue"
                value={featureForm.featurevalue}
                onChange={(e) => setFeatureForm({...featureForm, featurevalue: e.target.value})}
                placeholder="Например: Пенициллин"
                required
              />
              {!featureForm.featurevalue && (
                <p className="mt-1 text-sm text-red-500">Это поле обязательно для заполнения</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата выявления <span className="text-red-500">*</span>
              </label>
              <Input
                name="dateidentified"
                type="date"
                value={featureForm.dateidentified}
                onChange={(e) => setFeatureForm({...featureForm, dateidentified: e.target.value})}
                required
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isactive"
                name="isactive"
                checked={featureForm.isactive}
                onChange={(e) => setFeatureForm({...featureForm, isactive: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="isactive">Актуально</label>
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
              name="entrytype"
              value={entryForm.entrytype}
              onChange={(e) => setEntryForm({...entryForm, entrytype: e.target.value})}
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
              name="diagnosisid"
              value={entryForm.diagnosisid}
              onChange={(e) => setEntryForm({...entryForm, diagnosisid: e.target.value})}
              placeholder="Например: J18.9"
            />
            <Input
              label="Содержание"
              name="content"
              value={entryForm.content}
              onChange={(e) => setEntryForm({...entryForm, content: e.target.value})}
              placeholder="Подробное описание"
              multiline
              required
            />
            <div className="flex justify-between">
              <Button
                type="button"
                onClick={() => getRecommendations()}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!entryForm.diagnosisid}
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
              name="testid"
              value={labTestForm.testid}
              onChange={(e) => setLabTestForm({...labTestForm, testid: e.target.value})}
              options={labTestCatalog.map(test => ({
                value: test.testid,
                label: test.name,
              }))}
              required
            />
            <Select
              label="Статус"
              name="status"
              value={labTestForm.status}
              onChange={(e) => setLabTestForm({...labTestForm, status: e.target.value})}
              options={[
                {value: "ordered", label: "Назначен"},
                {value: "in_progress", label: "В процессе"},
                {value: "completed", label: "Завершен"},
                {value: "cancelled", label: "Отменен"},
              ]}
              required
            />
            {labTestForm.status === "completed" && (
              <>
                <Input
                  label="Результат"
                  name="resultvalue"
                  value={labTestForm.resultvalue}
                  onChange={(e) => setLabTestForm({...labTestForm, resultvalue: e.target.value})}
                  placeholder="Значение результата"
                  required
                />
                <Input
                  label="Референсные значения"
                  name="referencerange"
                  value={labTestForm.referencerange}
                  onChange={(e) => setLabTestForm({...labTestForm, referencerange: e.target.value})}
                  placeholder="Нормальные значения"
                />
                <Input
                  label="Интерпретация"
                  name="interpretation"
                  value={labTestForm.interpretation}
                  onChange={(e) => setLabTestForm({...labTestForm, interpretation: e.target.value})}
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
              name="medicationid"
              value={prescriptionForm.medicationid}
              onChange={(e) => setPrescriptionForm({...prescriptionForm, medicationid: e.target.value})}
              placeholder="ID лекарственного средства"
              required
            />
            <Input
              label="Дозировка"
              name="dosage"
              value={prescriptionForm.dosage}
              onChange={(e) => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})}
              placeholder="Например: 500 мг 2 раза в день"
              required
            />
            <Input
              label="Инструкции"
              name="instructions"
              value={prescriptionForm.instructions}
              onChange={(e) => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
              placeholder="Дополнительные инструкции"
              multiline
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isairecommended"
                name="isairecommended"
                checked={prescriptionForm.isairecommended}
                onChange={(e) => setPrescriptionForm({...prescriptionForm, isairecommended: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="isairecommended">Рекомендовано ИИ</label>
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