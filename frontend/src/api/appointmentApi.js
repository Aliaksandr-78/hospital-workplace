import api from "./axiosInstance"

/**
 * @returns {Promise<Array>} - Список приемов.
 */
export const getAppointments = async () => {
  try {
    const response = await api.get("appointment/appointmentAll/")
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке списка приемов:", error)
    throw error
  }
}

/**
 * @param {string} appointmentID - ID приема.
 * @returns {Promise<Object>} - Данные приема.
 */
export const getAppointmentById = async (appointmentID) => {
  try {
    const response = await api.get(`appointment/appointmentId/${appointmentID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке приема ID ${appointmentID}:`, error)
    throw error
  }
}

/**
 * @param {Object} appointmentData - Данные для создания приема.
 * @returns {Promise<Object>} - Созданный прием.
 */
export const createAppointment = async (appointmentData) => {
  try {
    const response = await api.post("appointment/appointmentCreate/", appointmentData)
    return response.data;
  } catch (error) {
    console.error("Ошибка при создании приема:", error)
    throw error
  }
}

/**
 * @param {string} appointmentID - ID приема.
 * @param {Object} updatedData - Обновленные данные.
 * @returns {Promise<Object>} - Обновленный прием.
 */
export const updateAppointment = async (appointmentID, updatedData) => {
  try {
    const response = await api.put(`appointment/appointmentUpdate/${appointmentID}`, updatedData)
    return response.data
  } catch (error) {
    console.error(`Ошибка при обновлении приема ID ${appointmentID}:`, error)
    throw error
  }
}

/**
 * @param {string} appointmentID - ID приема.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const deleteAppointment = async (appointmentID) => {
  try {
    const response = await api.delete(`appointment/appointmentDelete/${appointmentID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении приема ID ${appointmentID}:`, error)
    throw error;
  }
}