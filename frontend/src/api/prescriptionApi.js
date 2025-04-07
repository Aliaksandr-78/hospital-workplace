import api from "./axiosInstance"

/**
 * @param {Object} prescriptionData - Данные для создания рецепта.
 * @returns {Promise<Object>} - Созданный рецепт.
 */
export const createPrescription = async (prescriptionData) => {
  try {
    const response = await api.post("prescriptions/prescriptionCreate/", prescriptionData)
    return response.data
  } catch (error) {
    console.error("Ошибка при создании рецепта:", error)
    throw error
  }
}

/**
 * @returns {Promise<Array>} - Список рецептов.
 */
export const getAllPrescriptions = async () => {
  try {
    const response = await api.get("prescriptions/prescriptionAll/")
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке списка рецептов:", error)
    throw error
  }
}

/**
 * @param {string} prescriptionID - ID рецепта.
 * @returns {Promise<Object>} - Данные рецепта.
 */
export const getPrescriptionById = async (prescriptionID) => {
  try {
    const response = await api.get(`prescriptions/prescriptionId/${prescriptionID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке рецепта ID ${prescriptionID}:`, error)
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
    const response = await api.put(`prescriptions/prescriptionUpdate/${prescriptionID}`, updatedData)
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
    const response = await api.delete(`prescriptions/prescriptionDelete/${prescriptionID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении рецепта ID ${prescriptionID}:`, error)
    throw error
  }
}