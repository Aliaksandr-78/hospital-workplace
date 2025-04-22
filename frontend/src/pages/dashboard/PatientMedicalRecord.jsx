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
import { getAllDiagnoses } from "../../api/diagnosisApi";
import { getAllMedications } from "../../api/medicationApi";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Select from "../../components/Select";
import { useAuth } from "../../context/AuthContext";

const PatientMedicalRecord = () => {
  const { user } = useAuth();
  const { recordId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [patientFeatures, setPatientFeatures] = useState([]);
  const [entries, setEntries] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [labTestCatalog, setLabTestCatalog] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [medications, setMedications] = useState([]);
  
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
    featuretype: "disease",
    featurevalue: "",
    dateidentified: new Date().toISOString().split('T')[0],
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
    airecommendationscore: null,
    aicontraindicationschecked: false,
    rbprotocolcompliant: true
  });

  // Состояния для рекомендаций и временных назначений
  const [recommendations, setRecommendations] = useState([]);
  const [tempPrescriptions, setTempPrescriptions] = useState([]);
  const [doctorsSpecialties, setDoctorsSpecialties] = useState({});

  // Константы для типов данных
  const FEATURE_TYPES = [
    { value: "Заболевание", label: "Заболевание" },
    { value: "Патологическое состояние", label: "Патологическое состояние" },
    { value: "Аллергия", label: "Аллергия" },
    { value: "Непереносимость", label: "Непереносимость" },
    { value: "Физиологическая особенность", label: "Физиологическая особенность" },
    { value: "Привычка", label: "Привычка" },
    { value: "Психологический фактор", label: "Психологический фактор" }
  ];

  const ENTRY_TYPES = [
    { value: "Консультация", label: "Консультация" },
    { value: "Осмотр", label: "Осмотр" },
    { value: "Процедура", label: "Процедура" },
    { value: "Диагноз", label: "Диагноз" },
    { value: "Лечение", label: "Лечение" }
  ];

  const TEST_STATUSES = [
    { value: "Назначен", label: "Назначен" },
    { value: "В процессе", label: "В процессе" },
    { value: "Завершен", label: "Завершен" },
    { value: "Отменен", label: "Отменен" }
  ];

  // Получение специализации врача
  const getDoctorSpecialty = useCallback(async (doctorId) => {
    if (!doctorId) return "Неизвестно";
    if (doctorsSpecialties[doctorId]) return doctorsSpecialties[doctorId];

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

  // Загрузка всех данных при монтировании компонента
  useEffect(() => {
    if (!recordId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [
          recordData, 
          featuresData, 
          entriesData, 
          labTestsData, 
          specialtiesData, 
          labCatalogData,
          diagnosesData,
          medicationsData
        ] = await Promise.all([
          getMedicalRecordById(recordId),
          getFeaturesByPatient(recordId),
          getMedicalRecordEntriesByRecordId(recordId),
          getLabTestResultsByPatient(recordId),
          getAllSpecialties(),
          getAllLabTests(),
          getAllDiagnoses(),
          getAllMedications()
        ]);

        if (!recordData?.recordid) {
          throw new Error("Медицинская карта не найдена");
        }
        
        setMedicalRecord(recordData);
        setPatientFeatures(featuresData);
        setSpecialties(specialtiesData);
        setLabTestCatalog(labCatalogData);
        setLabTests(labTestsData);
        setDiagnoses(diagnosesData);
        setMedications(medicationsData);

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
            featuretype: "disease",
            featurevalue: "",
            dateidentified: new Date().toISOString().split('T')[0],
            isactive: true
          }
    );
    setError("");
    setFeatureModalOpen(true);
  };

  const handleFeatureSubmit = async (e) => {
    e.preventDefault();
    
    if (!featureForm.featuretype || !featureForm.featurevalue || !featureForm.dateidentified) {
      setError("Пожалуйста, заполните все обязательные поля");
      return;
    }
  
    try {
      const featureData = {
        patientid: medicalRecord.patientid,
        ...featureForm
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
        prev.map(f => (f.featureid === featureId ? updatedFeature : f))
      );
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
            // Не позволяем редактировать диагноз
            diagnosisid: entry.diagnosisid || ""
          }
        : {
            entrytype: "consultation",
            content: "",
            diagnosisid: ""
          }
    );
    setEntryModalOpen(true);
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // 1. Сначала сохраняем запись в медицинской карте
      const entryData = {
        recordid: recordId,
        doctorid: user.userid,
        ...entryForm
      };
  
      let savedEntry;
      if (selectedEntry) {
        // Редактирование существующей записи
        const updatedEntry = await updateMedicalRecordEntry(selectedEntry.entryid, {
          content: entryForm.content
        });
        savedEntry = updatedEntry;
        setEntries(prev => 
          prev.map(e => e.entryid === selectedEntry.entryid ? updatedEntry : e)
        );
      } else {
        // Создание новой записи
        savedEntry = await createMedicalRecordEntry(entryData);
        setEntries(prev => [...prev, savedEntry]);
      }
      console.log(savedEntry?.entryid)
      if (!savedEntry?.entryid) {
        throw new Error("Не удалось получить ID созданной записи");
      }
      // 2. Сохраняем все временные назначения и ждем завершения
      const savedPrescriptions = await Promise.all(
        tempPrescriptions.map(async p => {
          const prescription = await createPrescription({
            patientid: medicalRecord.patientid,
            doctorid: user.userid,
            medicationid: p.medicationid,
            dosage: p.dosage,
            instructions: p.instructions,
            isairecommended: p.isairecommended,
            airecommendationscore: p.airecommendationscore,
            aicontraindicationschecked: p.aicontraindicationschecked,
            rbprotocolcompliant: p.rbprotocolcompliant
          });
          
          if (!prescription?.prescriptionid) {
            throw new Error("Не удалось получить ID созданного назначения");
          }
          return prescription;
        })
      );
  
      // 3. Создаем связи между записью и назначениями
      await Promise.all(
        savedPrescriptions.map(async p => {
          try {
            console.log('Пытаемся создать связь для:', {
              entryId: savedEntry.entryid,
              prescrId: p.prescriptionid
            });
            
            await createEntryPrescription({
              entryid: savedEntry.entryid,
              prescriptionid: p.prescriptionid
            });
            
            console.log('Связь успешно создана');
          } catch (err) {
            console.error('Детали ошибки:', {
              entryId: savedEntry.entryid,
              prescrId: p.prescriptionid,
              error: err.message
            });
            throw new Error(`Не удалось создать связь для назначения ${p.prescriptionid}: ${err.message}`);
          }
        })
      );
  
      // Очищаем временные назначения
      setTempPrescriptions([]);
      setEntryModalOpen(false);
      
    } catch (error) {
      console.error("Полная ошибка при сохранении:", {
        error: error.message,
        stack: error.stack
      });
      setError(error.message || "Не удалось сохранить данные. Пожалуйста, попробуйте снова.");
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
            resultdate: labTest.resultdate || ""
          }
        : {
            testid: "",
            orderedby: user?.userid || "",
            resultvalue: "",
            referencerange: "",
            interpretation: "",
            status: "ordered",
            resultdate: ""
          }
    );
    setLabTestModalOpen(true);
  };

  const handleLabTestSubmit = async (e) => {
    e.preventDefault();
    
    if (!labTestForm.testid) {
      setError("Выберите тип теста");
      return;
    }
  
    try {
      const testData = {
        patientID: medicalRecord.patientid,
        testID: labTestForm.testid,
        orderedBy: labTestForm.orderedby,
        status: labTestForm.status,
        resultValue: labTestForm.resultvalue || null,
        referenceRange: labTestForm.referencerange || null,
        interpretation: labTestForm.interpretation || null,
        performedBy: (labTestForm.resultvalue && labTestForm.resultvalue.trim() !== "") 
          ? user?.userid 
          : null,
        ...(labTestForm.status === "completed" && {
          resultDate: labTestForm.resultdate || new Date().toISOString()
        })
      };
  
      let response;
      if (selectedLabTest) {
        response = await updateLabTestResult(selectedLabTest.resultid, testData);
        setLabTests(prev => 
          prev.map(t => t.resultid === response.resultid ? response : t)
        );
      } else {
        response = await createLabTestResult(testData);
        setLabTests(prev => [...prev, response]);
      }
      
      setLabTestModalOpen(false);
      setError("");
    } catch (error) {
      console.error("Ошибка сохранения теста:", error);
      setError(error.response?.data?.message || error.message || "Не удалось сохранить тест");
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
      airecommendationscore: null,
      aicontraindicationschecked: false,
      rbprotocolcompliant: true
    });
    setPrescriptionModalOpen(true);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      const medication = medications.find(m => String(m.medicationid) === String(prescriptionForm.medicationid));
      
      const newPrescription = {
        ...prescriptionForm,
        patientid: medicalRecord.patientid,
        doctorid: user.userid,
        medicationName: medication ? medication.name : `Препарат #${prescriptionForm.medicationid}`
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

  const handleSaveAll = async (entryId = null) => {
    try {
      const targetEntryId = entryId || selectedEntry?.entryid;
      if (!targetEntryId) {
        throw new Error("Не выбрана запись для привязки назначений");
      }

      // Сохраняем все временные назначения
      const savedPrescriptions = await Promise.all(
        tempPrescriptions.map(p => createPrescription(p))
      );

      // Создаем связи с записью
      await Promise.all(
        savedPrescriptions.map(p =>
          createEntryPrescription({
            entryid: targetEntryId,
            prescriptionid: p.prescriptionid,
          })
        )
      );

      // Очищаем временные назначения
      setTempPrescriptions([]);
    } catch (error) {
      console.error("Ошибка при сохранении назначений:", error);
      setError("Не удалось сохранить назначения.");
    }
  };

  // Обработчики для рекомендаций (опционально)
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
      medicationid: medication.MedicationID,
      dosage: medication.dosage || "",
      instructions: medication.instructions || "",
      isairecommended: true,
      airecommendationscore: medication.confidence,
      aicontraindicationschecked: medication.isSafe,
      rbprotocolcompliant: true
    });
    setRecommendationsModalOpen(false);
    setPrescriptionModalOpen(true);
  };

  const getTestName = (testId) => {
    const test = labTestCatalog.find(t => t.testid === testId);
    return test ? test.name : "Неизвестный тест";
  };

  const getDiagnosisName = (diagnosisId) => {
    const diagnosis = diagnoses.find(d => d.diagnosisid === diagnosisId);
    return diagnosis ? `${diagnosis.icd10code} - ${diagnosis.name}` : "Неизвестный диагноз";
  };

  const getMedicationName = useCallback((medicationId) => {
    if (!medicationId) return "Не указан препарат";
    
    // Приводим ID к строке для сравнения, так как из API могут приходить разные типы
    const medication = medications.find(m => 
      String(m.medicationid) === String(medicationId)
    );
    
    return medication ? medication.name : `Препарат (ID: ${medicationId})`;
  }, [medications]);

  if (loading) {
    return <Loader className="flex justify-center my-8" />;
  }

  if (!medicalRecord) {
    return <div className="text-center text-red-500">Медицинская карта не найдена</div>;
  }





  const PlusIcon = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  const LightBulbIcon = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );

  const TrashIcon = (props) => (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );

  const DocumentTextIcon = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

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
                        {test.testname || getTestName(test.testid)} ({test.status})
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
                  <p><strong>Диагноз:</strong> {getDiagnosisName(selectedEntry.diagnosisid)}</p>
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
                    <p><strong>Препарат:</strong> {getMedicationName(prescription.medicationid)}</p>
                    <p><strong>Дозировка:</strong> {prescription.dosage}</p>
                    <p><strong>Инструкции:</strong> {prescription.instructions}</p>
                    {prescription.isairecommended && (
                      <p className="text-sm text-blue-600">Рекомендовано ИИ (уверенность: {prescription.airecommendationscore ? (prescription.airecommendationscore * 100).toFixed(1) + '%' : 'не указана'})</p>
                    )}
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
                {selectedEntry.diagnosisid && (
                  <Button
                    onClick={getRecommendations}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Получить рекомендации
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
                <p><strong>Тест:</strong> {selectedLabTest.testname || getTestName(selectedLabTest.testid)}</p>
                <p><strong>Статус:</strong> {selectedLabTest.status}</p>
                <p><strong>Дата назначения:</strong> {new Date(selectedLabTest.orderdate).toLocaleString()}</p>
                
                {selectedLabTest.resultdate && (
                  <>
                    <p><strong>Дата результата:</strong> {new Date(selectedLabTest.resultdate).toLocaleString()}</p>
                    <p><strong>Результат:</strong> {selectedLabTest.resultvalue}</p>
                    <p><strong>Референсные значения:</strong> {selectedLabTest.referencerange}</p>
                    <p><strong>Интерпретация:</strong> {selectedLabTest.interpretation}</p>
                  </>
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
                value={featureForm.featuretype}
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
      <Modal isOpen={isEntryModalOpen} onClose={() => {
        if (tempPrescriptions.length > 0) {
          if (window.confirm("Отменить создание записи? Все временные назначения будут удалены.")) {
            setTempPrescriptions([]); // Очищаем временные назначения
            setEntryModalOpen(false);
          }
        } else {
          setEntryModalOpen(false);
        }
      }}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedEntry ? "Редактировать запись" : "Новая запись"}
          </h2>
          
          <form onSubmit={handleEntrySubmit} className="space-y-6">
            {selectedEntry ? (
              // Режим редактирования - статическое отображение
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тип записи
                  </label>
                  <div className="p-2 bg-gray-100 rounded">
                    {ENTRY_TYPES.find(t => t.value === selectedEntry.entrytype)?.label || selectedEntry.entrytype}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Диагноз
                  </label>
                  <div className="p-2 bg-gray-100 rounded">
                    {selectedEntry.diagnosisid 
                      ? getDiagnosisName(selectedEntry.diagnosisid)
                      : "Не указан"}
                  </div>
                </div>

                <Input
                  label="Содержание"
                  name="content"
                  value={entryForm.content}
                  onChange={(e) => setEntryForm({...entryForm, content: e.target.value})}
                  placeholder="Подробное описание..."
                  multiline
                  rows={4}
                  required
                />
              </div>
            ) : (
              // Режим создания - обычная форма
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Тип записи"
                  name="entrytype"
                  value={entryForm.entrytype}
                  onChange={(value) => setEntryForm({...entryForm, entrytype: value})}
                  options={ENTRY_TYPES}
                  required
                />

                <Select
                  label="Диагноз"
                  name="diagnosisid"
                  value={entryForm.diagnosisid}
                  onChange={(value) => setEntryForm({...entryForm, diagnosisid: value})}
                  options={diagnoses.map(d => ({
                    value: d.diagnosisid,
                    label: `${d.icd10code} - ${d.name}`
                  }))}
                  placeholder="Выберите диагноз"
                  isSearchable
                />

                <Input
                  label="Содержание"
                  name="content"
                  value={entryForm.content}
                  onChange={(e) => setEntryForm({...entryForm, content: e.target.value})}
                  placeholder="Подробное описание..."
                  multiline
                  rows={4}
                  required
                />
              </div>
            )}

            {/* Секция назначений */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Назначения</h3>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setPrescriptionForm({
                        medicationid: medications.length > 0 ? medications[0].medicationid : "",
                        dosage: "",
                        instructions: "",
                        isairecommended: false
                      });
                      setPrescriptionModalOpen(true);
                    }}
                    icon={<PlusIcon className="h-4 w-4" />}
                  >
                    Добавить
                  </Button>

                  {entryForm.diagnosisid && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={getRecommendations}
                      icon={<LightBulbIcon className="h-4 w-4" />}
                    >
                      Рекомендации ИИ
                    </Button>
                  )}
                </div>
              </div>

              {tempPrescriptions.length > 0 ? (
                <div className="space-y-3">
                  {tempPrescriptions.map((prescription, index) => {
                    // const medication = medications.find(m => m.medicationid === prescription.medicationid);
                    return (
                      <div key={index} className="flex items-start p-3 bg-white rounded-md shadow-xs border">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            {prescription.medicationName || `Препарат #${prescription.medicationid}`}
                          </p>
                          <div className="mt-1 text-sm text-gray-600 space-y-1">
                            {prescription.dosage && <p>Дозировка: {prescription.dosage}</p>}
                            {prescription.instructions && <p>Инструкции: {prescription.instructions}</p>}
                          </div>
                          {prescription.isairecommended && (
                            <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Рекомендация ИИ ({prescription.airecommendationscore ? `${Math.round(prescription.airecommendationscore * 100)}%` : 'высокая'})
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTempPrescription(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                          aria-label="Удалить назначение"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <DocumentTextIcon className="mx-auto h-10 w-10 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">Нет добавленных назначений</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Добавьте назначения вручную или получите рекомендации ИИ
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (tempPrescriptions.length > 0) {
                    if (window.confirm("Отменить создание записи? Все временные назначения будут удалены.")) {
                      setTempPrescriptions([]);
                      setEntryModalOpen(false);
                    }
                  } else {
                    setEntryModalOpen(false);
                  }
                }}
              >
                Отменить
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={!entryForm.content}
              >
                {selectedEntry ? "Сохранить" : "Создать запись"}
              </Button>
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
            {!selectedLabTest && (
              <Select
                label="Тест"
                name="testid"
                value={labTestForm.testid}
                onChange={(value) => setLabTestForm({...labTestForm, testid: value})}
                options={labTestCatalog.map(test => ({
                  value: test.testid,
                  label: test.name
                }))}
                required
                disabled={!!selectedLabTest}
              />
            )}

            <Select
              label="Статус"
              name="status"
              value={labTestForm.status}
              onChange={(value) => setLabTestForm({...labTestForm, status: value})}
              options={TEST_STATUSES}
              required
            />

            {(labTestForm.status === "completed" || selectedLabTest?.status === "completed") && (
              <>
                <Input
                  label="Дата результата"
                  name="resultdate"
                  type="datetime-local"
                  value={labTestForm.resultdate}
                  onChange={(e) => setLabTestForm({...labTestForm, resultdate: e.target.value})}
                />
                
                <Input
                  label="Результат"
                  name="resultvalue"
                  value={labTestForm.resultvalue}
                  onChange={(e) => setLabTestForm({...labTestForm, resultvalue: e.target.value})}
                  placeholder="Значение результата"
                  required={labTestForm.status === "completed"}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Препарат <span className="text-red-500">*</span>
              </label>
              <Select
                name="medicationid"
                value={prescriptionForm.medicationid}
                onChange={(value) => {
                  const selectedMed = medications.find(m => String(m.medicationid) === String(value));
                  setPrescriptionForm({
                    ...prescriptionForm,
                    medicationid: value,
                    medicationName: selectedMed ? selectedMed.name : ''
                  });
                }}
                options={medications.map(m => ({
                  value: m.medicationid,
                  label: m.name
                }))}
                placeholder="Выберите препарат"
                required
              />
            </div>

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
                onChange={(e) => setPrescriptionForm({
                  ...prescriptionForm, 
                  isairecommended: e.target.checked
                })}
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

      {/* Модальное окно с рекомендациями (опционально) */}
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