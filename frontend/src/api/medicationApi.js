import api from "./axiosInstance"

/**
 * @param {Object} medicationData - Данные для создания медикамента.
 * @returns {Promise<Object>} - Созданный медикамент.
 */
export const createMedication = async (medicationData) => {
  try {
    const response = await api.post("medications/medicationCreate/", medicationData)
    return response.data
  } catch (error) {
    console.error("Ошибка при создании медикамента:", error)
    throw error
  }
}

/**
 * @returns {Promise<Array>} - Список медикаментов.
 */
export const getAllMedications = async () => {
  try {
    const response = await api.get("medications/medicationAll/")
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке списка медикаментов:", error)
    throw error
  }
}

/**
 * @param {string} medicationID - ID медикамента.
 * @returns {Promise<Object>} - Данные медикамента.
 */
export const getMedicationById = async (medicationID) => {
  try {
    const response = await api.get(`medications/medicationId/${medicationID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке медикамента ID ${medicationID}:`, error)
    throw error
  }
}

/**
 * @param {string} medicationID - ID медикамента.
 * @param {Object} updatedData - Обновленные данные.
 * @returns {Promise<Object>} - Обновленный медикамент.
 */
export const updateMedication = async (medicationID, updatedData) => {
  try {
    const response = await api.put(`medications/medicationUpdate/${medicationID}`, updatedData)
    return response.data
  } catch (error) {
    console.error(`Ошибка при обновлении медикамента ID ${medicationID}:`, error)
    throw error
  }
}

/**
 * @param {string} medicationID - ID медикамента.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const deleteMedication = async (medicationID) => {
  try {
    const response = await api.delete(`medications/medicationDelete/${medicationID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении медикамента ID ${medicationID}:`, error)
    throw error
  }
}