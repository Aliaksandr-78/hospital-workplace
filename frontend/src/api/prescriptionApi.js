import api from "./axiosInstance"

/**
 * @returns {Promise<Array>} - Список всех рецептов с дополнительной информацией.
 */
export const getAllPrescriptions = async () => {
  try {
    const response = await api.get("prescription/prescriptionAll/")
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке списка рецептов:", error)
    throw error
  }
}

/**
 * @param {string} prescriptionID - ID рецепта.
 * @returns {Promise<Object>} - Данные рецепта с дополнительной информацией.
 */
export const getPrescriptionById = async (prescriptionID) => {
  try {
    const response = await api.get(`prescription/prescriptionId/${prescriptionID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке рецепта ID ${prescriptionID}:`, error)
    throw error
  }
}

/**
 * @param {Object} prescriptionData - Данные для создания рецепта.
 * @returns {Promise<Object>} - Созданный рецепт.
 */
export const createPrescription = async (prescriptionData) => {
  try {
    const response = await api.post("prescription/prescriptionCreate/", prescriptionData)
    return response.data
  } catch (error) {
    console.error("Ошибка при создании рецепта:", error)
    throw error
  }
}

/**
 * @param {string} prescriptionID - ID рецепта.
 * @param {Object} updatedData - Обновленные данные.
 * @returns {Promise<Object>} - Обновленный рецепт.
 */
export const updatePrescription = async (prescriptionID, updatedData) => {
  try {
    const response = await api.put(`prescription/prescriptionUpdate/${prescriptionID}`, updatedData)
    return response.data
  } catch (error) {
    console.error(`Ошибка при обновлении рецепта ID ${prescriptionID}:`, error)
    throw error
  }
}

/**
 * @param {string} prescriptionID - ID рецепта.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const deletePrescription = async (prescriptionID) => {
  try {
    const response = await api.delete(`prescription/prescriptionDelete/${prescriptionID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении рецепта ID ${prescriptionID}:`, error)
    throw error
  }
}