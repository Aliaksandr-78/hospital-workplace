import api from "./axiosInstance";

/**
 * @typedef {Object} MedicationRecommendation
 * @property {number} MedicationID - ID лекарства
 * @property {string} name - Название лекарства
 * @property {number} confidence - Уверенность рекомендации (0-1)
 * @property {boolean} [isFirstLine] - Препарат первой линии
 * @property {string} source - Источник рекомендации
 * @property {number} weight - Вес рекомендации
 * @property {boolean} isSafe - Безопасно для пациента
 * @property {Array} [contraindications] - Противопоказания
 */

/**
 * @typedef {Object} RecommendationResponse
 * @property {string} diagnosis - Название диагноза
 * @property {Array<MedicationRecommendation>} recommendations - Список рекомендаций
 * @property {Object} modelMetrics - Статистика по моделям
 * @property {number} modelMetrics.protocol - Количество протокольных рекомендаций
 * @property {number} modelMetrics.bayes - Количество рекомендаций от Байеса
 * @property {number} modelMetrics.decisionTree - Количество рекомендаций от дерева решений
 * @property {number} modelMetrics.similarPatients - Количество рекомендаций от похожих пациентов
 */

/**
 * Получает рекомендации лекарств по диагнозу
 * @param {string} diagnosisId - ID диагноза
 * @param {string} [patientId] - ID пациента (опционально)
 * @returns {Promise<RecommendationResponse>} - Ответ с рекомендациями
 */
export const getMedicationRecommendations = async (diagnosisId, patientId = null) => {
  try {
    const params = patientId ? { patientId } : {};
    const response = await api.get(`ai/recommend/${diagnosisId}`, { params });
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при получении рекомендаций для диагноза ID ${diagnosisId}:`, 
      error
    );
    throw error;
  }
};

/**
 * @typedef {Object} PrescriptionFeedbackData
 * @property {string} prescriptionId - ID назначения
 * @property {number} effectiveness - Эффективность (1-5)
 * @property {string} [sideEffects] - Побочные эффекты
 * @property {string} [comments] - Комментарии врача
 */

/**
 * Отправляет обратную связь по назначению
 * @param {PrescriptionFeedbackData} feedbackData - Данные обратной связи
 * @returns {Promise<Object>} - Результат сохранения
 */
export const sendPrescriptionFeedback = async (feedbackData) => {
  try {
    const response = await api.post("ai/feedback", feedbackData);
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при отправке обратной связи для назначения ID ${feedbackData.prescriptionId}:`,
      error
    );
    throw error;
  }
};

/**
 * Создает назначение на основе ИИ-рекомендации
 * @param {Object} prescriptionData - Данные для назначения
 * @param {string} prescriptionData.diagnosisId - ID диагноза
 * @param {string} prescriptionData.medicationId - ID лекарства
 * @param {string} prescriptionData.patientId - ID пациента
 * @param {string} prescriptionData.doctorId - ID врача
 * @param {string} prescriptionData.dosage - Дозировка
 * @param {string} prescriptionData.instructions - Инструкции
 * @returns {Promise<Object>} - Созданное назначение
 */
export const createAIRecommendation = async (prescriptionData) => {
  try {
    const response = await api.post("ai/create-prescription", prescriptionData);
    return response.data;
  } catch (error) {
    console.error(
      "Ошибка при создании назначения на основе ИИ-рекомендации:",
      error
    );
    throw error;
  }
};

/**
 * Получает историю рекомендаций для пациента
 * @param {string} patientId - ID пациента
 * @returns {Promise<Array>} - История рекомендаций
 */
export const getPatientRecommendationHistory = async (patientId) => {
  try {
    const response = await api.get(`ai/history/${patientId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Ошибка при получении истории рекомендаций для пациента ID ${patientId}:`,
      error
    );
    throw error;
  }
};