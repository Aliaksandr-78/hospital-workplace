import api from "./axiosInstance"

/**
 * @param {Object} dischargeData - Данные для создания выписки.
 * @returns {Promise<Object>} - Созданная выписка.
 */
export const createMedicalDischarge = async (dischargeData) => {
  try {
    const response = await api.post("medical-discharge/medicalDischargeCreate/", dischargeData)
    return response.data
  } catch (error) {
    console.error("Ошибка при создании медицинской выписки:", error)
    throw error
  }
}

/**
 * @returns {Promise<Array>} - Список выписок.
 */
export const getAllMedicalDischarges = async () => {
  try {
    const response = await api.get("medical-discharge/medicalDischargeAll/")
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке списка медицинских выписок:", error)
    throw error
  }
}

/**
 * @param {string} dischargeID - ID выписки.
 * @returns {Promise<Object>} - Данные выписки.
 */
export const getMedicalDischargeById = async (dischargeID) => {
  try {
    const response = await api.get(`medical-discharge/medicalDischargeId/${dischargeID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке медицинской выписки ID ${dischargeID}:`, error)
    throw error
  }
}

/**
 * @param {string} dischargeID - ID выписки.
 * @param {Object} updatedData - Обновленные данные.
 * @returns {Promise<Object>} - Обновленная выписка.
 */
export const updateMedicalDischarge = async (dischargeID, updatedData) => {
  try {
    const response = await api.put(`medical-discharge/medicalDischargeUpdate/${dischargeID}`, updatedData)
    return response.data
  } catch (error) {
    console.error(`Ошибка при обновлении медицинской выписки ID ${dischargeID}:`, error)
    throw error
  }
}

/**
 * @param {string} dischargeID - ID выписки.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const deleteMedicalDischarge = async (dischargeID) => {
  try {
    const response = await api.delete(`medical-discharge/medicalDischargeDelete/${dischargeID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении медицинской выписки ID ${dischargeID}:`, error)
    throw error
  }
}