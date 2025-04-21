import api from "./axiosInstance";

/**
 * Создание нового результата лабораторного теста
 * @param {Object} testResultData - Данные результата теста
 * @param {number} testResultData.patientID - ID пациента
 * @param {number} testResultData.testID - ID теста
 * @param {number} testResultData.orderedBy - ID врача, назначившего тест
 * @param {number} [testResultData.performedBy] - ID специалиста, выполнившего тест
 * @param {string} [testResultData.resultValue] - Значение результата
 * @param {string} [testResultData.referenceRange] - Референсные значения
 * @param {string} [testResultData.interpretation] - Интерпретация результата
 * @param {string} [testResultData.status] - Статус теста
 * @returns {Promise<Object>} - Созданный результат теста
 */
export const createLabTestResult = async (data) => {
  try {
    const response = await api.post(
      "lab-test-result/labTestResultCreate/",
      data
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || "Неверные данные теста");
    }
    console.error("Ошибка при создании теста:", error);
    throw new Error(error.response?.data?.message || "Не удалось создать тест");
  }
};

/**
 * Получение всех результатов лабораторных тестов
 * @returns {Promise<Array>} - Список всех результатов тестов
 */
export const getAllLabTestResults = async () => {
  try {
    const response = await api.get("lab-test-result/labTestResultAll");
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении всех результатов тестов:", error);
    throw error;
  }
};

/**
 * Получение результата теста по ID
 * @param {number} resultID - ID результата теста
 * @returns {Promise<Object>} - Данные результата теста
 */
export const getLabTestResultById = async (resultID) => {
  try {
    const response = await api.get(
      `lab-test-result/labTestResultId/${resultID}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при получении результата теста ID ${resultID}:`,
      error
    );
    throw error;
  }
};

/**
 * Получение всех результатов тестов для пациента
 * @param {number} patientID - ID пациента
 * @returns {Promise<Array>} - Список результатов тестов пациента
 */
export const getLabTestResultsByPatient = async (patientID) => {
  try {
    const response = await api.get(
      `lab-test-result/labTestResultPatient/${patientID}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при получении результатов тестов для пациента ID ${patientID}:`,
      error
    );
    throw error;
  }
};

/**
 * Обновление результата теста
 * @param {number} resultID - ID результата теста
 * @param {Object} updatedData - Обновленные данные
 * @param {string} [updatedData.resultValue] - Значение результата
 * @param {string} [updatedData.referenceRange] - Референсные значения
 * @param {string} [updatedData.interpretation] - Интерпретация результата
 * @param {string} [updatedData.status] - Статус теста
 * @param {number} [updatedData.performedBy] - ID специалиста, выполнившего тест
 * @param {string} [updatedData.resultDate] - Дата выполнения теста
 * @returns {Promise<Object>} - Обновленный результат теста
 */
export const updateLabTestResult = async (resultID, data) => {
  try {
    const response = await api.put(
      `lab-test-result/labTestResultUpdate/${resultID}`,
      data
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || "Неверные данные теста");
    }
    if (error.response?.status === 404) {
      throw new Error("Тест не найден");
    }
    console.error(`Ошибка при обновлении теста ID ${resultID}:`, error);
    throw new Error(error.response?.data?.message || "Не удалось обновить тест");
  }
};

/**
 * Удаление результата теста
 * @param {number} resultID - ID результата теста
 * @returns {Promise<Object>} - Результат удаления
 */
export const deleteLabTestResult = async (resultID) => {
  try {
    const response = await api.delete(
      `lab-test-result/labTestResultDelete/${resultID}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при удалении результата теста ID ${resultID}:`,
      error
    );
    throw error;
  }
};