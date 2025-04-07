import api from "./axiosInstance";

/**
 * @param {Object} eventTypeData - Данные для создания типа события.
 * @returns {Promise<Object>} - Созданный тип события.
 */
export const createEventType = async (eventTypeData) => {
  try {
    const response = await api.post("event-types/eventTypesCreate/", eventTypeData);
    return response.data;
  } catch (error) {
    console.error("Ошибка при создании типа события:", error);
    throw error;
  }
};

/**
 * @returns {Promise<Array>} - Список всех типов событий.
 */
export const getAllEventTypes = async () => {
  try {
    const response = await api.get("event-types/eventTypesAll/");
    return response.data;
  } catch (error) {
    console.error("Ошибка при загрузке списка типов событий:", error);
    throw error;
  }
};

/**
 * @param {string} eventTypeID - ID типа события.
 * @returns {Promise<Object>} - Данные типа события.
 */
export const getEventTypeById = async (eventTypeID) => {
  try {
    const response = await api.get(`event-types/eventTypesId/${eventTypeID}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при загрузке типа события ID ${eventTypeID}:`, error);
    throw error;
  }
};

/**
 * @param {string} eventTypeID - ID типа события.
 * @param {Object} updatedData - Обновленные данные.
 * @returns {Promise<Object>} - Обновленный тип события.
 */
export const updateEventType = async (eventTypeID, updatedData) => {
  try {
    const response = await api.put(`event-types/eventTypesUpdate/${eventTypeID}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при обновлении типа события ID ${eventTypeID}:`, error);
    throw error;
  }
};

/**
 * @param {string} eventTypeID - ID типа события.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const deleteEventType = async (eventTypeID) => {
  try {
    const response = await api.delete(`event-types/eventTypesDelete/${eventTypeID}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при удалении типа события ID ${eventTypeID}:`, error);
    throw error;
  }
};