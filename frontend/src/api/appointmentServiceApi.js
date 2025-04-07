import api from "./axiosInstance"

/**
 * @param {Object} appointmentServiceData - Данные для добавления услуги.
 * @returns {Promise<Object>} - Результат добавления.
 */
export const addServiceToAppointment = async (appointmentServiceData) => {
  try {
    const response = await api.post("appointment-service/appointmentServiceCreate/", appointmentServiceData)
    return response.data
  } catch (error) {
    console.error("Ошибка при добавлении услуги к приему:", error)
    throw error
  }
}

/**
 * @param {string} appointmentID - ID приема.
 * @returns {Promise<Array>} - Список услуг.
 */
export const getServicesByAppointment = async (appointmentID) => {
  try {
    const response = await api.get(`appointment-service/appointmentServiceId/${appointmentID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при получении услуг для приема ID ${appointmentID}:`, error)
    throw error
  }
}

/**
 * @param {string} appointmentServiceID - ID услуги.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const removeServiceFromAppointment = async (appointmentServiceID) => {
  try {
    const response = await api.delete(`appointment-service/appointmentServiceDelete/${appointmentServiceID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении услуги ID ${appointmentServiceID} из приема:`, error)
    throw error
  }
}