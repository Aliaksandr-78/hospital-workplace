import api from "./axiosInstance"

/**
 * @param {Object} serviceData - Данные для создания услуги.
 * @returns {Promise<Object>} - Созданная услуга.
 */
export const createService = async (serviceData) => {
  try {
    const response = await api.post("service/serviceCreate/", serviceData)
    return response.data
  } catch (error) {
    console.error("Ошибка при создании услуги:", error)
    throw error
  }
}

/**
 * @returns {Promise<Array>} - Список услуг.
 */
export const getAllServices = async () => {
  try {
    const response = await api.get("service/serviceAll/");
    return response.data;
  } catch (error) {
    console.error("Ошибка при загрузке списка услуг:", error)
    throw error
  }
}

/**
 * @param {string} serviceID - ID услуги.
 * @returns {Promise<Object>} - Данные услуги.
 */
export const getServiceById = async (serviceID) => {
  try {
    const response = await api.get(`service/serviceId/${serviceID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке услуги ID ${serviceID}:`, error)
    throw error
  }
}

/**
 * @param {string} serviceID - ID услуги.
 * @param {Object} updatedData - Обновленные данные.
 * @returns {Promise<Object>} - Обновленная услуга.
 */
export const updateService = async (serviceID, updatedData) => {
  try {
    const response = await api.put(`service/serviceUpdate/${serviceID}`, updatedData)
    return response.data
  } catch (error) {
    console.error(`Ошибка при обновлении услуги ID ${serviceID}:`, error)
    throw error
  }
}

/**
 * @param {string} serviceID - ID услуги.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const deleteService = async (serviceID) => {
  try {
    const response = await api.delete(`service/serviceDelete/${serviceID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении услуги ID ${serviceID}:`, error)
    throw error
  }
}