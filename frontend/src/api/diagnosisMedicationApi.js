import api from "./axiosInstance"

/**
 * Создает связь между диагнозом и лекарством
 * @param {Object} data - Данные связи {DiagnosisID, MedicationID, Confidence, IsFirstLine, ProtocolReference}
 * @returns {Promise<Object>} - Созданная связь
 */
export const createDiagnosisMedication = async (data) => {
  try {
    const response = await api.post("diagnosis-medication/diagnosisMedicationCreate/", data)
    return response.data
  } catch (error) {
    console.error("Ошибка при создании связи диагноз-лекарство:", error)
    throw error
  }
}

/**
 * Получает все лекарства для указанного диагноза
 * @param {number} diagnosisID - ID диагноза
 * @returns {Promise<Array>} - Список лекарств с дополнительной информацией
 */
export const getMedicationsByDiagnosis = async (diagnosisID) => {
  try {
    const response = await api.get(`diagnosis-medication/diagnosisMedicationByDiagnosis/${diagnosisID}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return []; // Возвращаем пустой массив при 404 ошибке
    }
    console.error(`Ошибка при загрузке лекарств для диагноза ID ${diagnosisID}:`, error);
    throw error;
  }
};

/**
 * Обновляет данные связи диагноз-лекарство
 * @param {number} diagnosisID - ID диагноза
 * @param {number} medicationID - ID лекарства
 * @param {Object} data - Новые данные {Confidence, IsFirstLine, ProtocolReference}
 * @returns {Promise<Object>} - Обновленная связь
 */
export const updateDiagnosisMedication = async (diagnosisID, medicationID, data) => {
  try {
    const response = await api.put(
      `diagnosis-medication/diagnosisMedicationUpdate/${diagnosisID}/${medicationID}`,
      data
    )
    return response.data
  } catch (error) {
    console.error(
      `Ошибка при обновлении связи диагноз ID ${diagnosisID} - лекарство ID ${medicationID}:`,
      error
    )
    throw error
  }
}

/**
 * Удаляет связь между диагнозом и лекарством
 * @param {number} diagnosisID - ID диагноза
 * @param {number} medicationID - ID лекарства
 * @returns {Promise<Object>} - Результат удаления
 */
export const deleteDiagnosisMedication = async (diagnosisID, medicationID) => {
  try {
    const response = await api.delete(
      `diagnosis-medication/diagnosisMedicationDelete/${diagnosisID}/${medicationID}`
    )
    return response.data
  } catch (error) {
    console.error(
      `Ошибка при удалении связи диагноз ID ${diagnosisID} - лекарство ID ${medicationID}:`,
      error
    )
    throw error
  }
}