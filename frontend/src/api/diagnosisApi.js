import api from "./axiosInstance"

/**
 * Создает новый диагноз
 * @param {Object} diagnosisData - Данные диагноза {ICD10Code, Name, Description, Symptoms, RBClinicalGuidelines}
 * @returns {Promise<Object>} - Созданный диагноз
 */
export const createDiagnosis = async (diagnosisData) => {
  try {
    const response = await api.post("diagnosis/diagnosisCreate/", diagnosisData)
    return response.data
  } catch (error) {
    console.error("Ошибка при создании диагноза:", error)
    throw error
  }
}

/**
 * Получает все диагнозы
 * @returns {Promise<Array>} - Список всех диагнозов
 */
export const getAllDiagnoses = async () => {
  try {
    const response = await api.get("diagnosis/diagnosisAll/")
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке списка диагнозов:", error)
    throw error
  }
}

/**
 * Получает диагноз по ID
 * @param {number} diagnosisID - ID диагноза
 * @returns {Promise<Object>} - Данные диагноза
 */
export const getDiagnosisById = async (diagnosisID) => {
  try {
    const response = await api.get(`diagnosis/diagnosisId/${diagnosisID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке диагноза ID ${diagnosisID}:`, error)
    throw error
  }
}

/**
 * Обновляет данные диагноза
 * @param {number} diagnosisID - ID диагноза
 * @param {Object} diagnosisData - Новые данные диагноза
 * @returns {Promise<Object>} - Обновленные данные диагноза
 */
export const updateDiagnosis = async (diagnosisID, diagnosisData) => {
  try {
    const response = await api.put(`diagnosis/diagnosisUpdete/${diagnosisID}`, diagnosisData)
    return response.data
  } catch (error) {
    console.error(`Ошибка при обновлении диагноза ID ${diagnosisID}:`, error)
    throw error
  }
}

/**
 * Удаляет диагноз
 * @param {number} diagnosisID - ID диагноза
 * @returns {Promise<Object>} - Результат удаления
 */
export const deleteDiagnosis = async (diagnosisID) => {
  try {
    const response = await api.delete(`diagnosis/diagnosisDelete/${diagnosisID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении диагноза ID ${diagnosisID}:`, error)
    throw error
  }
}