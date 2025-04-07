import api from "./axiosInstance"

/**
 * @param {Object} testData - Данные для создания теста.
 * @returns {Promise<Object>} - Созданный тест.
 */
export const createLabTest = async (testData) => {
  try {
    const response = await api.post("lab-test-catalog/labTestCatalogCreate/", testData)
    return response.data
  } catch (error) {
    console.error("Ошибка при создании лабораторного теста:", error)
    throw error
  }
}

/**
 * @returns {Promise<Array>} - Список тестов.
 */
export const getAllLabTests = async () => {
  try {
    const response = await api.get("lab-test-catalog/labTestCatalogAll/")
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке списка лабораторных тестов:", error)
    throw error
  }
}

/**
 * @param {string} testID - ID теста.
 * @returns {Promise<Object>} - Данные теста.
 */
export const getLabTestById = async (testID) => {
  try {
    const response = await api.get(`lab-test-catalog/labTestCatalogId/${testID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке лабораторного теста ID ${testID}:`, error)
    throw error
  }
}

/**
 * @param {string} testID - ID теста.
 * @param {Object} updatedData - Обновленные данные.
 * @returns {Promise<Object>} - Обновленный тест.
 */
export const updateLabTest = async (testID, updatedData) => {
  try {
    const response = await api.put(`lab-test-catalog/labTestCatalogUpdate/${testID}`, updatedData)
    return response.data
  } catch (error) {
    console.error(`Ошибка при обновлении лабораторного теста ID ${testID}:`, error)
    throw error
  }
}

/**
 * @param {string} testID - ID теста.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const deleteLabTest = async (testID) => {
  try {
    const response = await api.delete(`lab-test-catalog/labTestCatalogDelete/${testID}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при удалении лабораторного теста ID ${testID}:`, error)
    throw error
  }
}