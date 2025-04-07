import api from "./axiosInstance"

/**
 * @param {Object} scheduleData - Данные для создания расписания.
 * @returns {Promise<Object>} - Созданное расписание.
 */
export const createSchedule = async (scheduleData) => {
  try {
    const response = await api.post("schedule/scheduleCreate/", {
      doctorID: scheduleData.doctorid,
      date: scheduleData.date,
      startTime: scheduleData.starttime,
      endTime: scheduleData.endtime,
      eventTypeID: scheduleData.eventtypeid,
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при создании расписания:", error);
    throw error;
  }
};

/**
 * @returns {Promise<Array>} - Список расписаний.
 */
export const getAllSchedules = async () => {
  try {
    const response = await api.get("schedule/scheduleAll/")
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке списка расписаний:", error)
    throw error
  }
}

/**
 * @param {string} scheduleID - ID расписания.
 * @returns {Promise<Object>} - Данные расписания.
 */
export const getScheduleById = async (scheduleID) => {
  try {
    const response = await api.get(`schedule/scheduleId/${scheduleID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке расписания ID ${scheduleID}:`, error)
    throw error
  }
}

/**
 * @param {string} scheduleID - ID расписания.
 * @param {Object} updatedData - Обновленные данные.
 * @returns {Promise<Object>} - Обновленное расписание.
 */
export const updateSchedule = async (scheduleID, updatedData) => {
  try {
    const response = await api.put(`schedule/scheduleUpdate/${scheduleID}`, {
      doctorID: updatedData.doctorid,
      date: updatedData.date,
      startTime: updatedData.starttime,
      endTime: updatedData.endtime,
      eventTypeID: updatedData.eventtypeid,
    })
    return response.data
  } catch (error) {
    console.error(`Ошибка при обновлении расписания ID ${scheduleID}:`, error)
    throw error
  }
}

/**
 * @param {string} scheduleID - ID расписания.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const deleteSchedule = async (scheduleID) => {
  try {
    const response = await api.delete(`schedule/scheduleDelete/${scheduleID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении расписания ID ${scheduleID}:`, error)
    throw error
  }
}