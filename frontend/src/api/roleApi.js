import api from "./axiosInstance"

/**
 * @param {Object} roleData - Данные для создания роли.
 * @returns {Promise<Object>} - Созданная роль.
 */
export const createRole = async (roleData) => {
  try {
    const response = await api.post("role/roleCreate/", roleData)
    return response.data
  } catch (error) {
    console.error("Ошибка при создании роли:", error)
    throw error
  }
}

/**
 * @returns {Promise<Array>} - Список ролей.
 */
export const getAllRoles = async () => {
  try {
    const response = await api.get("role/roleAll/")
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке списка ролей:", error)
    throw error
  }
}

/**
 * @param {string} roleID - ID роли.
 * @returns {Promise<Object>} - Данные роли.
 */
export const getRoleById = async (roleID) => {
  try {
    const response = await api.get(`role/roleId/${roleID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке роли ID ${roleID}:`, error)
    throw error
  }
}

/**
 * @param {string} roleID - ID роли.
 * @param {Object} updatedData - Обновленные данные.
 * @returns {Promise<Object>} - Обновленная роль.
 */
export const updateRole = async (roleID, updatedData) => {
  try {
    const response = await api.put(`role/roleUpdate/${roleID}`, updatedData)
    return response.data
  } catch (error) {
    console.error(`Ошибка при обновлении роли ID ${roleID}:`, error)
    throw error
  }
}

/**
 * @param {string} roleID - ID роли.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const deleteRole = async (roleID) => {
  try {
    const response = await api.delete(`role/roleDelete/${roleID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении роли ID ${roleID}:`, error)
    throw error
  }
}