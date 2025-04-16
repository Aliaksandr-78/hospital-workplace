import api from "./axiosInstance";

/**
 * Создание новой записи в медицинской карте
 * @param {Object} entryData - Данные записи { recordID, doctorID, entryType, content, diagnosisID }
 * @returns {Promise<Object>} - Созданная запись
 */
export const createMedicalRecordEntry = async (entryData) => {
  try {
    const response = await api.post(
      "medical-record-entry/medicalRecordEntryCreate/",
      entryData
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка при создании записи в медицинской карте:", error);
    throw error;
  }
};

/**
 * Получение записи медицинской карты по ID
 * @param {string} entryID - ID записи
 * @returns {Promise<Object>} - Данные записи
 */
export const getMedicalRecordEntryById = async (entryID) => {
  try {
    const response = await api.get(
      `medical-record-entry/medicalRecordEntryId/${entryID}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при получении записи медицинской карты ID ${entryID}:`,
      error
    );
    throw error;
  }
};

/**
 * Получение всех записей медицинской карты по RecordID
 * @param {string} recordID - ID медицинской карты
 * @returns {Promise<Array>} - Список всех записей для указанной карты
 */
export const getMedicalRecordEntriesByRecordId = async (recordID) => {
  try {
    const response = await api.get(
      `medical-record-entry/medicalRecordEntryAll/${recordID}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при получении записей медицинской карты для RecordID ${recordID}:`,
      error
    );
    throw error;
  }
};

/**
 * Обновление записи медицинской карты
 * @param {string} entryID - ID записи
 * @param {Object} updatedData - Обновленные данные { content, diagnosisID }
 * @returns {Promise<Object>} - Обновленная запись
 */
export const updateMedicalRecordEntry = async (entryID, updatedData) => {
  try {
    const response = await api.put(
      `medical-record-entry/medicalRecordEntryUpdate/${entryID}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при обновлении записи медицинской карты ID ${entryID}:`,
      error
    );
    throw error;
  }
};

/**
 * Удаление записи медицинской карты
 * @param {string} entryID - ID записи
 * @returns {Promise<Object>} - Результат удаления
 */
export const deleteMedicalRecordEntry = async (entryID) => {
  try {
    const response = await api.delete(
      `medical-record-entry/medicalRecordEntryDelete/${entryID}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при удалении записи медицинской карты ID ${entryID}:`,
      error
    );
    throw error;
  }
};