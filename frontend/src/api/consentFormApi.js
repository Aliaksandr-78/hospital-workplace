import api from "./axiosInstance"

/**
 * @param {Object} consentData - Данные для создания согласия.
 * @returns {Promise<Object>} - Созданное согласие.
 */
export const createConsentForm = async (consentData) => {
  try {
    const response = await api.post("consent-form/consentFormCreate/", consentData)
    return response.data
  } catch (error) {
    console.error("Ошибка при создании согласия:", error)
    throw error
  }
}

/**
 * @returns {Promise<Array>} - Список согласий.
 */
export const getAllConsentForms = async () => {
  try {
    const response = await api.get("consent-form/consentFormAll/")
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке списка согласий:", error)
    throw error
  }
}

/**
 * @param {string} consentID - ID согласия.
 * @returns {Promise<Object>} - Данные согласия.
 */
export const getConsentFormById = async (consentID) => {
  try {
    const response = await api.get(`consent-form/consentFormId/${consentID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке согласия ID ${consentID}:`, error)
    throw error
  }
}

/**
 * @param {string} consentID - ID согласия.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const deleteConsentForm = async (consentID) => {
  try {
    const response = await api.delete(`consent-form/consentFormDelete/${consentID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении согласия ID ${consentID}:`, error)
    throw error
  }
}