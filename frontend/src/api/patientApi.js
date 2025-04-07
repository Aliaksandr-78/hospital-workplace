import api from "./axiosInstance"

/**
 * @param {Object} patientData - Данные для создания пациента.
 * @returns {Promise<Object>} - Созданный пациент.
 */
export const createPatient = async (patientData) => {
  try {
    const response = await api.post("patients/patientCreate/", patientData)
    return response.data
  } catch (error) {
    console.error("Ошибка при создании пациента:", error)
    throw error
  }
}

/**
 * @returns {Promise<Array>} - Список пациентов.
 */
export const getAllPatients = async () => {
  try {
    const response = await api.get("patients/patientAll/")
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке списка пациентов:", error)
    throw error
  }
}

/**
 * @param {string} patientID - ID пациента.
 * @returns {Promise<Object>} - Данные пациента.
 */
export const getPatientById = async (patientID) => {
  try {
    const response = await api.get(`patients/patientId/${patientID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке пациента ID ${patientID}:`, error)
    throw error
  }
}

/**
 * @param {string} patientID - ID пациента.
 * @param {Object} updatedData - Обновленные данные.
 * @returns {Promise<Object>} - Обновленный пациент.
 */
export const updatePatient = async (patientID, updatedData) => {
  try {
    const response = await api.put(`patients/patientUpdate/${patientID}`, updatedData)
    return response.data
  } catch (error) {
    console.error(`Ошибка при обновлении пациента ID ${patientID}:`, error)
    throw error
  }
}

/**
 * @param {string} patientID - ID пациента.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const deletePatient = async (patientID) => {
  try {
    const response = await api.delete(`patients/patientDelete/${patientID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении пациента ID ${patientID}:`, error)
    throw error
  }
}