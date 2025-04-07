import api from "./axiosInstance"

/**
 * @param {Object} specialtyData - Данные для создания специальности.
 * @returns {Promise<Object>} - Созданная специальность.
 */
export const createSpecialty = async (specialtyData) => {
  try {
    const response = await api.post("specialty/specialtyCreate/", specialtyData)
    return response.data
  } catch (error) {
    console.error("Ошибка при создании специальности:", error)
    throw error
  }
}

/**
 * @returns {Promise<Array>} - Список специальностей.
 */
export const getAllSpecialties = async () => {
  try {
    const response = await api.get("specialty/specialtyAll/")
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке списка специальностей:", error)
    throw error
  }
}

/**
 * @param {string} specialtyID - ID специальности.
 * @returns {Promise<Object>} - Данные специальности.
 */
export const getSpecialtyById = async (specialtyID) => {
  try {
    const response = await api.get(`specialty/specialtyId/${specialtyID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке специальности ID ${specialtyID}:`, error)
    throw error
  }
}

/**
 * @param {string} specialtyID - ID специальности.
 * @param {Object} updatedData - Обновленные данные.
 * @returns {Promise<Object>} - Обновленная специальность.
 */
export const updateSpecialty = async (specialtyID, updatedData) => {
  try {
    const response = await api.put(`specialty/specialtyUpdate/${specialtyID}`, updatedData)
    return response.data
  } catch (error) {
    console.error(`Ошибка при обновлении специальности ID ${specialtyID}:`, error)
    throw error
  }
}

/**
 * @param {string} specialtyID - ID специальности.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const deleteSpecialty = async (specialtyID) => {
  try {
    const response = await api.delete(`specialty/specialtyDelete/${specialtyID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении специальности ID ${specialtyID}:`, error)
    throw error
  }
}