import api from "./axiosInstance"

/**
 * @param {Object} certificateData - Данные для создания сертификата.
 * @returns {Promise<Object>} - Созданный сертификат.
 */
export const createMedicalCertificate = async (certificateData) => {
  try {
    const response = await api.post("medical-certificate/medicalCertificateCreate/", certificateData)
    return response.data
  } catch (error) {
    console.error("Ошибка при создании медицинского сертификата:", error)
    throw error
  }
}

/**
 * @returns {Promise<Array>} - Список сертификатов.
 */
export const getAllMedicalCertificates = async () => {
  try {
    const response = await api.get("medical-certificate/medicalCertificateAll/")
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке списка медицинских сертификатов:", error)
    throw error
  }
}

/**
 * @param {string} certificateID - ID сертификата.
 * @returns {Promise<Object>} - Данные сертификата.
 */
export const getMedicalCertificateById = async (certificateID) => {
  try {
    const response = await api.get(`medical-certificate/medicalCertificateId/${certificateID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке медицинского сертификата ID ${certificateID}:`, error)
    throw error
  }
}

/**
 * @param {string} certificateID - ID сертификата.
 * @param {Object} updatedData - Обновленные данные.
 * @returns {Promise<Object>} - Обновленный сертификат.
 */
export const updateMedicalCertificate = async (certificateID, updatedData) => {
  try {
    const response = await api.put(`medical-certificate/medicalCertificateUpdate/${certificateID}`, updatedData)
    return response.data
  } catch (error) {
    console.error(`Ошибка при обновлении медицинского сертификата ID ${certificateID}:`, error)
    throw error
  }
}

/**
 * @param {string} certificateID - ID сертификата.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const deleteMedicalCertificate = async (certificateID) => {
  try {
    const response = await api.delete(`medical-certificate/medicalCertificateDelete/${certificateID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении медицинского сертификата ID ${certificateID}:`, error)
    throw error;
  }
}