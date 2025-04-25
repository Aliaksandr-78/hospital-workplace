import api from "./axiosInstance";

/**
 * Создает новое противопоказание для лекарства
 * @param {Object} data - Данные противопоказания
 * @param {number} data.MedicationID - ID лекарства
 * @param {string} data.Condition - Противопоказание/состояние
 * @param {string} data.ConditionType - Тип противопоказания
 * @param {string} data.Severity - Степень риска (низкая, средняя, высокая)
 * @param {string} data.Description - Подробное описание
 * @param {string} data.RBReference - Ссылка на инструкцию в РБ
 * @returns {Promise<Object>} - Созданное противопоказание
 */
export const createMedicationContraindication = async (data) => {
  try {
    const response = await api.post(
      "medication-contraindications/medicationContraindicationsCreate/", 
      data
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка при создании противопоказания:", error);
    throw error;
  }
};

/**
 * Получает противопоказание по ID
 * @param {number} contraindicationID - ID противопоказания
 * @returns {Promise<Object>} - Данные противопоказания
 */
export const getContraindicationById = async (contraindicationID) => {
  try {
    const response = await api.get(
      `medication-contraindications/medicationContraindicationsId/${contraindicationID}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при получении противопоказания ID ${contraindicationID}:`, 
      error
    );
    throw error;
  }
};

/**
 * Получает все противопоказания для указанного лекарства
 * @param {number} medicationID - ID лекарства
 * @returns {Promise<Array>} - Список противопоказаний
 */
export const getContraindicationsByMedication = async (medicationID) => {
  try {
    const response = await api.get(
      `medication-contraindications/medicationContraindicationsByMedication/${medicationID}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при получении противопоказаний для лекарства ID ${medicationID}:`,
      error
    );
    throw error;
  }
};

/**
 * Обновляет данные противопоказания
 * @param {number} contraindicationID - ID противопоказания
 * @param {Object} data - Новые данные противопоказания
 * @returns {Promise<Object>} - Обновленные данные противопоказания
 */
export const updateContraindication = async (contraindicationID, data) => {
  try {
    const response = await api.put(
      `medication-contraindications/medicationContraindicationsUpdate/${contraindicationID}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при обновлении противопоказания ID ${contraindicationID}:`,
      error
    );
    throw error;
  }
};

/**
 * Удаляет противопоказание
 * @param {number} contraindicationID - ID противопоказания
 * @returns {Promise<Object>} - Результат удаления
 */
export const deleteContraindication = async (contraindicationID) => {
  try {
    const response = await api.delete(
      `medication-contraindications/medicationContraindicationsDelete/${contraindicationID}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при удалении противопоказания ID ${contraindicationID}:`,
      error
    );
    throw error;
  }
};