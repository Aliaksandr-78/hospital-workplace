import api from "./axiosInstance"

/**
 * @param {Object} userData - Данные для регистрации пользователя.
 * @returns {Promise<Object>} - Зарегистрированный пользователь.
 */
export const registerUser = async (userData) => {
  try {
    const response = await api.post("user/userRegister/", userData)
    return response.data
  } catch (error) {
    console.error("Ошибка при регистрации пользователя:", error)
    throw error
  }
}

/**
 * @param {Object} credentials - Данные для входа.
 * @returns {Promise<Object>} - Данные пользователя.
 */
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("user/userLogin/", credentials)
    return response.data
  } catch (error) {
    console.error("Ошибка при входе в систему:", error)
    throw error
  }
}

export const validateToken = async (token) => {
  try {
    const response = await api.get("user/validateToken/", {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error) {
    console.error("Ошибка при проверке токена:", error)
    throw error
  }
}

/**
 * @returns {Promise<Array>} - Список пользователей.
 */
export const getAllUsers = async () => {
  try {
    const response = await api.get("user/userAll/")
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке списка пользователей:", error)
    throw error
  }
}

/**
 * @param {string} userID - ID пользователя.
 * @returns {Promise<Object>} - Данные пользователя.
 */
export const getUserById = async (userID) => {
  try {
    const response = await api.get(`user/userId/${userID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке пользователя ID ${userID}:`, error)
    throw error
  }
}

/**
 * @param {string} userID - ID пользователя.
 * @param {Object} updatedData - Обновленные данные.
 * @returns {Promise<Object>} - Обновленный пользователь.
 */
export const updateUser = async (userID, updatedData) => {
  try {
    const response = await api.put(`user/userUpdate/${userID}`, updatedData)
    return response.data
  } catch (error) {
    console.error(`Ошибка при обновлении пользователя ID ${userID}:`, error)
    throw error
  }
}

/**
 * @param {string} userID - ID пользователя.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const deleteUser = async (userID) => {
  try {
    const response = await api.delete(`user/userDelete/${userID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении пользователя ID ${userID}:`, error)
    throw error
  }
}