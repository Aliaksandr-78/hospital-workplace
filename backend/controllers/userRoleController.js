const { pool } = require('../config/db')

const userRoleController = {
  // Назначение роли пользователю
  async assignRole(req, res) {
    try {
      const { userID, roleID } = req.body

      // Проверяем, есть ли уже такая роль у пользователя
      const checkQuery = `
        SELECT * FROM UserRoles 
        WHERE UserID = $1 AND RoleID = $2;
      `
      const checkResult = await pool.query(checkQuery, [userID, roleID])

      if (checkResult.rows.length > 0) {
        return res.status(400).json({ message: "Роль уже назначена пользователю" })
      }

      // Добавляем новую роль
      const insertQuery = `
        INSERT INTO UserRoles (UserID, RoleID) 
        VALUES ($1, $2) RETURNING *;
      `
      const insertResult = await pool.query(insertQuery, [userID, roleID])

      res.status(201).json(insertResult.rows[0])
    } catch (error) {
      console.error("Ошибка при назначении роли:", error)
      res.status(500).json({ error: error.message })
    }
  },

  // Получение ролей пользователя с названиями
  async getByUserID(req, res) {
    try {
      const { userID } = req.params

      const query = `
        SELECT UserRoles.UserRoleID, UserRoles.UserID, UserRoles.RoleID, Roles.RoleName 
        FROM UserRoles
        JOIN Roles ON UserRoles.RoleID = Roles.RoleID
        WHERE UserRoles.UserID = $1;
      `
      const result = await pool.query(query, [userID])

      res.json(result.rows)
    } catch (error) {
      console.error("Ошибка при получении ролей пользователя:", error)
      res.status(500).json({ error: error.message })
    }
  },

  // Получение пользователей по роли
  async getByRoleID(req, res) {
    try {
      const { roleID } = req.params

      const query = `
        SELECT UserRoles.UserRoleID, UserRoles.UserID, UserRoles.RoleID, Users.FirstName, Users.LastName 
        FROM UserRoles
        JOIN Users ON UserRoles.UserID = Users.UserID
        WHERE UserRoles.RoleID = $1;
      `
      const result = await pool.query(query, [roleID])

      res.json(result.rows)
    } catch (error) {
      console.error("Ошибка при получении пользователей по роли:", error)
      res.status(500).json({ error: error.message })
    }
  },

  // Удаление роли у пользователя
  async removeRole(req, res) {
    try {
      const { userRoleID } = req.params; // Получаем userRoleID из URL
  
      // Удаляем роль по userRoleID
      const deleteQuery = `
        DELETE FROM UserRoles 
        WHERE UserRoleID = $1 
        RETURNING *;
      `;
      const deleteResult = await pool.query(deleteQuery, [userRoleID]);
  
      if (deleteResult.rows.length === 0) {
        return res.status(404).json({ message: "Роль не найдена у пользователя" });
      }
  
      res.json({ message: "Роль удалена", data: deleteResult.rows[0] });
    } catch (error) {
      console.error("Ошибка при удалении роли:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateUserRoles(req, res) {
    try {
      const { userID, newRoles } = req.body;
  
      // Получаем текущие роли пользователя
      const currentRolesQuery = `
        SELECT UserRoleID, RoleID FROM UserRoles 
        WHERE UserID = $1;
      `;
      const currentRolesResult = await pool.query(currentRolesQuery, [userID]);
      const currentRoles = currentRolesResult.rows;
  
      // Роли для добавления
      const rolesToAdd = newRoles.filter(
        (roleID) => !currentRoles.some((cr) => cr.roleid === roleID)
      );
  
      // Роли для удаления
      const rolesToRemove = currentRoles.filter(
        (cr) => !newRoles.includes(cr.roleid)
      );
  
      // Удаляем старые роли
      for (const role of rolesToRemove) {
        const deleteQuery = `
          DELETE FROM UserRoles 
          WHERE UserRoleID = $1;
        `;
        await pool.query(deleteQuery, [role.userroleid]);
      }
  
      // Добавляем новые роли
      for (const roleID of rolesToAdd) {
        const insertQuery = `
          INSERT INTO UserRoles (UserID, RoleID) 
          VALUES ($1, $2) 
          RETURNING *;
        `;
        await pool.query(insertQuery, [userID, roleID]);
      }
  
      // Возвращаем обновленные роли
      const updatedRolesQuery = `
        SELECT UserRoles.UserRoleID, UserRoles.UserID, UserRoles.RoleID, Roles.RoleName 
        FROM UserRoles
        JOIN Roles ON UserRoles.RoleID = Roles.RoleID
        WHERE UserRoles.UserID = $1;
      `;
      const updatedRolesResult = await pool.query(updatedRolesQuery, [userID]);
  
      res.status(200).json(updatedRolesResult.rows);
    } catch (error) {
      console.error("Ошибка при обновлении ролей пользователя:", error);
      res.status(500).json({ error: error.message });
    }
  },
}

module.exports = userRoleController