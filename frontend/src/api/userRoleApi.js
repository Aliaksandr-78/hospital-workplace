import api from "./axiosInstance";

export const assignUserRole = async (userRoleData) => {
  try {
    const response = await api.post("user-role/userRoleAssign/", {
      userID: userRoleData.userid,
      roleID: userRoleData.roleid,
    });
    console.log("Assign Role Response:", response.data); // Логирование
    return response.data;
  } catch (error) {
    console.error("Ошибка при назначении роли пользователю:", error);
    throw error;
  }
};

export const getUserRolesByUserId = async (userID) => {
  try {
    const response = await api.get(`user-role/userRoleUserId/${userID}`);
    console.log("User Roles Response:", response.data); // Логирование
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении ролей пользователя ID ${userID}:`, error);
    throw error;
  }
};

export const getUsersByRoleId = async (roleID) => {
  try {
    const response = await api.get(`user-role/userRoleRoleId/${roleID}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении пользователей с ролью ID ${roleID}:`, error);
    throw error;
  }
};

export const removeUserRole = async (userRoleID) => {
  try {
    const response = await api.delete(`user-role/userRoleRemove/${userRoleID}`);
    console.log("Remove Role Response:", response.data); // Логирование
    return response.data;
  } catch (error) {
    console.error(`Ошибка при удалении роли ID ${userRoleID}:`, error);
    throw error;
  }
};

export const updateUserRoles = async (userID, newRoles) => {
  try {
    const response = await api.put('user-role/userRoleUpdate/', {
      userID,
      newRoles,
    });
    console.log('Update Roles Response:', response.data); // Логирование
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении ролей пользователя:', error);
    throw error;
  }
}