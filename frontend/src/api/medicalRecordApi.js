import api from "./axiosInstance"

/**
 * @param {Object} recordData - Данные для создания карты.
 * @returns {Promise<Object>} - Созданная карта.
 */
export const createMedicalRecord = async (recordData) => {
  try {
    const response = await api.post("medical-records/medicalRecordCreate/", recordData)
    return response.data
  } catch (error) {
    console.error("Ошибка при создании медицинской карты:", error)
    throw error
  }
}

/**
 * @returns {Promise<Array>} - Список карт.
 */
export const getAllMedicalRecords = async () => {
  try {
    const response = await api.get("medical-records/medicalRecordAll/")
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке списка медицинских карт:", error)
    throw error
  }
}

/**
 * @param {string} recordID - ID карты.
 * @returns {Promise<Object>} - Данные карты.
 */
export const getMedicalRecordById = async (recordID) => {
  try {
    const response = await api.get(`medical-records/medicalRecordId/${recordID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке медицинской карты ID ${recordID}:`, error)
    throw error
  }
}

/**
 * @param {string} recordID - ID карты.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const deleteMedicalRecord = async (recordID) => {
  try {
    const response = await api.delete(`medical-records/medicalRecordDelete/${recordID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении медицинской карты ID ${recordID}:`, error)
    throw error
  }
}