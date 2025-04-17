import { useEffect, useState } from "react";
import {
  getAllMedications,
  createMedication,
  updateMedication,
  deleteMedication,
} from "../../api/medicationApi";
import {
  getContraindicationsByMedication,
  createMedicationContraindication,
  updateContraindication,
  deleteContraindication,
} from "../../api/medicationContraindicationsApi";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Select from "../../components/Select";

const ManageMedications = () => {
  const [medications, setMedications] = useState([]);
  const [contraindications, setContraindications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contraindicationsLoading, setContraindicationsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isContraindicationModalOpen, setContraindicationModalOpen] = useState(false);
  const [currentMedication, setCurrentMedication] = useState(null);
  const [currentContraindication, setCurrentContraindication] = useState(null);
  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    DosageRecommendations: "",
    Category: "",
    Contraindications: "",
    SideEffects: "",
    Interactions: "",
    IsPrescriptionOnly: true,
    RBRegistrationNumber: ""
  });
  const [contraindicationFormData, setContraindicationFormData] = useState({
    Condition: "",
    Severity: "средняя",
    Description: "",
    RBReference: ""
  });

  const medicationCategories = [
    { value: "Антибиотики", label: "Антибиотики" },
    { value: "Противовирусные и противогрибковые средства", label: "Противовирусные и противогрибковые средства" },
    { value: "Нестероидные противовоспалительные препараты (НПВП)", label: "Нестероидные противовоспалительные препараты (НПВП)" },
    { value: "Анальгетики и спазмолитики", label: "Анальгетики и спазмолитики" },
    { value: "Антигистаминные препараты", label: "Антигистаминные препараты" },
    { value: "Сердечно-сосудистые средства", label: "Сердечно-сосудистые средства" },
    { value: "Гормональные препараты", label: "Гормональные препараты" },
    { value: "Желудочно-кишечные средства", label: "Желудочно-кишечные средства" },
    { value: "Психотропные и нейротропные средства", label: "Психотропные и нейротропные средства" },
    { value: "Витамины и БАДы", label: "Витамины и БАДы" }
  ];

  const severityOptions = [
    { value: "низкая", label: "Низкая" },
    { value: "средняя", label: "Средняя" },
    { value: "высокая", label: "Высокая" }
  ];

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true);
        const data = await getAllMedications();
        setMedications(data);
      } catch (error) {
        console.error("Ошибка при загрузке лекарств:", error);
        setError("Не удалось загрузить лекарства. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, []);

  const fetchContraindications = async (medicationID) => {
    try {
      setContraindicationsLoading(true);
      const data = await getContraindicationsByMedication(medicationID);
      setContraindications(data);
    } catch (error) {
      console.error("Ошибка при загрузке противопоказаний:", error);
      setError("Не удалось загрузить противопоказания.");
    } finally {
      setContraindicationsLoading(false);
    }
  };

  const openModal = (medication = null) => {
    setCurrentMedication(medication);
    setFormData(
      medication
        ? {
            Name: medication.name || "",
            Description: medication.description || "",
            DosageRecommendations: medication.dosagerecommendations || "",
            Category: medication.category || "",
            Contraindications: medication.contraindications || "",
            SideEffects: medication.sideeffects || "",
            Interactions: medication.interactions || "",
            IsPrescriptionOnly: medication.isprescriptiononly !== undefined ? medication.isprescriptiononly : true,
            RBRegistrationNumber: medication.rbregistrationnumber || ""
          }
        : {
            Name: "",
            Description: "",
            DosageRecommendations: "",
            Category: "",
            Contraindications: "",
            SideEffects: "",
            Interactions: "",
            IsPrescriptionOnly: true,
            RBRegistrationNumber: ""
          }
    );
    setModalOpen(true);
  };

  const openDetailModal = async (medication) => {
    setCurrentMedication(medication);
    await fetchContraindications(medication.medicationid);
    setDetailModalOpen(true);
  };

  const openContraindicationModal = (contraindication = null) => {
    setCurrentContraindication(contraindication);
    setContraindicationFormData(
      contraindication
        ? {
            Condition: contraindication.condition || "",
            Severity: contraindication.severity || "средняя",
            Description: contraindication.description || "",
            RBReference: contraindication.rbreference || ""
          }
        : {
            Condition: "",
            Severity: "средняя",
            Description: "",
            RBReference: ""
          }
    );
    setContraindicationModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentMedication(null);
    setFormData({
      Name: "",
      Description: "",
      DosageRecommendations: "",
      Category: "",
      Contraindications: "",
      SideEffects: "",
      Interactions: "",
      IsPrescriptionOnly: true,
      RBRegistrationNumber: ""
    });
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setContraindications([]);
  };

  const closeContraindicationModal = () => {
    setContraindicationModalOpen(false);
    setCurrentContraindication(null);
    setContraindicationFormData({
      Condition: "",
      Severity: "средняя",
      Description: "",
      RBReference: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContraindicationInputChange = (e) => {
    const { name, value } = e.target;
    setContraindicationFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const medicationData = {
      name: formData.Name,
      description: formData.Description,
      dosageRecommendations: formData.DosageRecommendations,
      category: formData.Category,
      contraindications: formData.Contraindications,
      sideEffects: formData.SideEffects,
      interactions: formData.Interactions,
      isPrescriptionOnly: formData.IsPrescriptionOnly,
      rbRegistrationNumber: formData.RBRegistrationNumber
    };

    try {
      if (currentMedication) {
        const updatedMedication = await updateMedication(currentMedication.medicationid, medicationData);
        setMedications(prev =>
          prev.map(medication =>
            medication.medicationid === updatedMedication.medicationid ? updatedMedication : medication
          )
        );
      } else {
        const newMedication = await createMedication(medicationData);
        setMedications(prev => [...prev, newMedication]);
      }
      closeModal();
    } catch (error) {
      console.error("Ошибка при сохранении лекарства:", error);
      setError("Не удалось сохранить лекарство. Пожалуйста, попробуйте позже.");
    }
  };

  const handleContraindicationSubmit = async (e) => {
    e.preventDefault();
    const contraindicationData = {
      MedicationID: currentMedication.medicationid,
      ...contraindicationFormData
    };

    try {
      if (currentContraindication) {
        await updateContraindication(
          currentContraindication.contraindicationid,
          contraindicationData
        );
      } else {
        await createMedicationContraindication(contraindicationData);
      }
      await fetchContraindications(currentMedication.medicationid);
      closeContraindicationModal();
    } catch (error) {
      console.error("Ошибка при сохранении противопоказания:", error);
      setError("Не удалось сохранить противопоказание.");
    }
  };

  const handleDelete = async (medicationID) => {
    try {
      await deleteMedication(medicationID);
      setMedications(prev => prev.filter(medication => medication.medicationid !== medicationID));
    } catch (error) {
      console.error("Ошибка при удалении лекарства:", error);
      setError("Не удалось удалить лекарство. Пожалуйста, попробуйте позже.");
    }
  };

  const handleDeleteContraindication = async (contraindicationID) => {
    try {
      await deleteContraindication(contraindicationID);
      setContraindications(prev => prev.filter(c => c.contraindicationid !== contraindicationID));
    } catch (error) {
      console.error("Ошибка при удалении противопоказания:", error);
      setError("Не удалось удалить противопоказание.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Управление лекарственными средствами" />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Управление лекарственными средствами
        </h1>

        {loading && <Loader className="flex justify-center my-8" />}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex justify-end mb-4">
          <Button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700">
            Добавить лекарство
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Название</th>
                <th className="py-2 px-4 border-b">Категория</th>
                <th className="py-2 px-4 border-b">Рецептурный</th>
                <th className="py-2 px-4 border-b">Действия</th>
              </tr>
            </thead>
            <tbody>
              {medications.map(medication => (
                <tr key={medication.medicationid} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{medication.medicationid}</td>
                  <td className="py-2 px-4 border-b">{medication.name}</td>
                  <td className="py-2 px-4 border-b">{medication.category || "-"}</td>
                  <td className="py-2 px-4 border-b">
                    {medication.isprescriptiononly ? "Да" : "Нет"}
                  </td>
                  <td className="py-2 px-4 border-b space-x-2">
                    <Button
                      onClick={() => openDetailModal(medication)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Подробнее
                    </Button>
                    <Button
                      onClick={() => openModal(medication)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Редактировать
                    </Button>
                    <Button
                      onClick={() => handleDelete(medication.medicationid)}
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

        {/* Модальное окно для лекарства */}
        <Modal isOpen={isModalOpen} onClose={closeModal} size="lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentMedication ? "Редактировать лекарство" : "Добавить лекарство"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Название*"
                  name="Name"
                  value={formData.Name}
                  onChange={handleInputChange}
                  placeholder="Согласно РБ фармакопее"
                  required
                />
                <Select
                  label="Категория препарата*"
                  name="Category"
                  value={formData.Category}
                  onChange={(value) => setFormData(prev => ({ ...prev, Category: value }))}
                  options={medicationCategories}
                  placeholder="Выберите категорию"
                  required
                />
                <Input
                  label="Регистрационный номер в РБ"
                  name="RBRegistrationNumber"
                  value={formData.RBRegistrationNumber}
                  onChange={handleInputChange}
                  placeholder="Введите регистрационный номер"
                />
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    name="IsPrescriptionOnly"
                    checked={formData.IsPrescriptionOnly}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="IsPrescriptionOnly" className="ml-2 block text-sm text-gray-900">
                    Рецептурный препарат
                  </label>
                </div>
              </div>

              <Input
                label="Описание и фармакологическая группа"
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                placeholder="Введите описание"
                multiline
                rows={3}
              />

              <Input
                label="Рекомендации по дозировке"
                name="DosageRecommendations"
                value={formData.DosageRecommendations}
                onChange={handleInputChange}
                placeholder="Введите рекомендации по дозировке"
                multiline
                rows={3}
              />

              <Input
                label="Противопоказания"
                name="Contraindications"
                value={formData.Contraindications}
                onChange={handleInputChange}
                placeholder="Введите противопоказания"
                multiline
                rows={3}
              />

              <Input
                label="Побочные эффекты"
                name="SideEffects"
                value={formData.SideEffects}
                onChange={handleInputChange}
                placeholder="Введите возможные побочные эффекты"
                multiline
                rows={3}
              />

              <Input
                label="Взаимодействия с другими препаратами"
                name="Interactions"
                value={formData.Interactions}
                onChange={handleInputChange}
                placeholder="Введите информацию о взаимодействиях"
                multiline
                rows={3}
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
                  {currentMedication ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Модальное окно с подробной информацией о лекарстве */}
        <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal} size="xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Подробная информация о лекарстве
            </h2>
            
            {currentMedication && (
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Название:</p>
                    <p>{currentMedication.name}</p>
                  </div>
                  <div>
                    <p className="font-medium">Категория:</p>
                    <p>{currentMedication.category || "-"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Рецептурный:</p>
                    <p>{currentMedication.isprescriptiononly ? "Да" : "Нет"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Регистрационный номер:</p>
                    <p>{currentMedication.rbregistrationnumber || "-"}</p>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium">Описание:</p>
                  <p className="whitespace-pre-line">{currentMedication.description || "Нет данных"}</p>
                </div>
                
                <div>
                  <p className="font-medium">Рекомендации по дозировке:</p>
                  <p className="whitespace-pre-line">{currentMedication.dosagerecommendations || "Нет данных"}</p>
                </div>
                
                <div>
                  <p className="font-medium">Побочные эффекты:</p>
                  <p className="whitespace-pre-line">{currentMedication.sideeffects || "Нет данных"}</p>
                </div>
                
                <div>
                  <p className="font-medium">Взаимодействия:</p>
                  <p className="whitespace-pre-line">{currentMedication.interactions || "Нет данных"}</p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Противопоказания</h3>
                <Button 
                  onClick={() => openContraindicationModal(null)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Добавить противопоказание
                </Button>
              </div>

              {contraindicationsLoading ? (
                <Loader className="flex justify-center my-4" />
              ) : contraindications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">Состояние</th>
                        <th className="py-2 px-4 border-b">Степень риска</th>
                        <th className="py-2 px-4 border-b">Описание</th>
                        <th className="py-2 px-4 border-b">Ссылка</th>
                        <th className="py-2 px-4 border-b">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contraindications.map(contraindication => (
                        <tr key={contraindication.contraindicationid} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{contraindication.condition}</td>
                          <td className="py-2 px-4 border-b capitalize">{contraindication.severity}</td>
                          <td className="py-2 px-4 border-b">{contraindication.description || "-"}</td>
                          <td className="py-2 px-4 border-b">{contraindication.rbreference || "-"}</td>
                          <td className="py-2 px-4 border-b space-x-2">
                            <Button
                              onClick={() => openContraindicationModal(contraindication)}
                              className="bg-blue-600 hover:bg-blue-700 text-sm"
                            >
                              Редактировать
                            </Button>
                            <Button
                              onClick={() => handleDeleteContraindication(contraindication.contraindicationid)}
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
                <p className="text-gray-500">Нет противопоказаний</p>
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

        {/* Модальное окно для добавления/редактирования противопоказания */}
        <Modal isOpen={isContraindicationModalOpen} onClose={closeContraindicationModal} size="md">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentContraindication ? "Редактировать противопоказание" : "Добавить противопоказание"}
            </h2>
            <form onSubmit={handleContraindicationSubmit} className="space-y-4">
              <Input
                label="Состояние*"
                name="Condition"
                value={contraindicationFormData.Condition}
                onChange={handleContraindicationInputChange}
                placeholder="Например: Беременность"
                required
              />

              <Select
                label="Степень риска*"
                name="Severity"
                value={contraindicationFormData.Severity}
                onChange={(value) => setContraindicationFormData(prev => ({ ...prev, Severity: value }))}
                options={severityOptions}
                required
              />

              <Input
                label="Описание"
                name="Description"
                value={contraindicationFormData.Description}
                onChange={handleContraindicationInputChange}
                placeholder="Подробное описание"
                multiline
                rows={3}
              />

              <Input
                label="Ссылка на инструкцию в РБ"
                name="RBReference"
                value={contraindicationFormData.RBReference}
                onChange={handleContraindicationInputChange}
                placeholder="Номер инструкции или приказа"
              />

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  onClick={closeContraindicationModal}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Отмена
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {currentContraindication ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ManageMedications;