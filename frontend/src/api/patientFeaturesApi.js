import api from "./axiosInstance";

/**
 * Создает новую особенность пациента
 * @param {Object} data - Данные особенности
 * @param {number} data.PatientID - ID пациента
 * @param {string} data.FeatureType - Тип особенности
 * @param {string} data.FeatureValue - Значение особенности
 * @param {string} data.DateIdentified - Дата выявления (опционально)
 * @param {boolean} data.IsActive - Актуальность (по умолчанию true)
 * @returns {Promise<Object>} - Созданная особенность
 */
export const createPatientFeature = async (data) => {
  try {
    const response = await api.post(
      "patient-features/patientFeaturesCreate/", 
      data
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || "Такая особенность уже существует");
    }
    console.error("Ошибка при создании особенности пациента:", error);
    throw new Error("Не удалось создать особенность пациента");
  }
};

/**
 * Получает особенность по ID
 * @param {number} featureID - ID особенности
 * @returns {Promise<Object>} - Данные особенности
 */
export const getPatientFeatureById = async (featureID) => {
  try {
    const response = await api.get(
      `patient-features/patientFeaturesId/${featureID}`
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("Особенность пациента не найдена");
    }
    console.error(
      `Ошибка при получении особенности пациента ID ${featureID}:`, 
      error
    );
    throw new Error("Не удалось получить данные об особенности пациента");
  }
};

/**
 * Получает все особенности для указанного пациента
 * @param {number} patientID - ID пациента
 * @returns {Promise<Array>} - Список особенностей
 */
export const getFeaturesByPatient = async (patientID) => {
  try {
    const response = await api.get(
      `patient-features/patientFeaturesByPatient/${patientID}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при получении особенностей пациента ID ${patientID}:`,
      error
    );
    throw new Error("Не удалось получить список особенностей пациента");
  }
};

/**
 * Обновляет данные особенности пациента
 * @param {number} featureID - ID особенности
 * @param {Object} data - Новые данные особенности
 * @returns {Promise<Object>} - Обновленные данные особенности
 */
export const updatePatientFeature = async (featureID, data) => {
  try {
    const response = await api.put(
      `patient-features/patientFeaturesUpdate/${featureID}`,
      data
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || "Такая особенность уже существует");
    }
    if (error.response?.status === 404) {
      throw new Error("Особенность пациента не найдена");
    }
    console.error(
      `Ошибка при обновлении особенности ID ${featureID}:`,
      error
    );
    throw new Error("Не удалось обновить особенность пациента");
  }
};

/**
 * Удаляет особенность пациента
 * @param {number} featureID - ID особенности
 * @returns {Promise<Object>} - Результат удаления
 */
export const deletePatientFeature = async (featureID) => {
  try {
    const response = await api.delete(
      `patient-features/patientFeaturesDelete/${featureID}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при удалении особенности ID ${featureID}:`,
      error
    );
    throw new Error("Не удалось удалить особенность пациента");
  }
};

/**
 * Изменяет статус активности особенности
 * @param {number} featureID - ID особенности
 * @returns {Promise<Object>} - Обновленные данные особенности
 */
export const toggleFeatureStatus = async (featureID) => {
  try {
    const response = await api.patch(
      `patient-features/patientFeaturesToggleStatus/${featureID}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при изменении статуса особенности ID ${featureID}:`,
      error
    );
    throw new Error("Не удалось изменить статус особенности");
  }
};