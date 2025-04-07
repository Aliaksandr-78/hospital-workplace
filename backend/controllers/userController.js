const { pool } = require('../config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userController = {
    async register(req, res) {
        try {
            const { firstName, middleName, lastName, email, password, phoneNumber, dateOfBirth, specialtyID } = req.body
            const passwordHash = await bcrypt.hash(password, 10)

            const query = `
                INSERT INTO Users (FirstName, MiddleName, LastName, Email, PasswordHash, PhoneNumber, DateOfBirth, SpecialtyID) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
            `
            const values = [firstName, middleName, lastName, email, passwordHash, phoneNumber, dateOfBirth, specialtyID]
            const result = await pool.query(query, values)
            
            res.status(201).json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body
            const query = `SELECT * FROM Users WHERE Email = $1;`
            const result = await pool.query(query, [email])

            if (!result.rows.length) {
                return res.status(401).json({ message: "Invalid credentials" })
            }

            const user = result.rows[0]
            const isMatch = await bcrypt.compare(password, user.passwordhash)

            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" })
            }

            const token = jwt.sign({ userID: user.userid, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
            res.json({ token, user })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async validateToken(req, res) {
        try {
          const token = req.headers.authorization?.split(" ")[1];
          if (!token) {
            return res.status(401).json({ message: "Токен отсутствует" });
          }
    
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await pool.query("SELECT * FROM Users WHERE UserID = $1", [decoded.userID]);
    
          if (!user.rows.length) {
            return res.status(401).json({ message: "Пользователь не найден" });
          }
    
          res.json(user.rows[0]);
        } catch (error) {
          console.error("Ошибка при проверке токена:", error);
          res.status(401).json({ message: "Недействительный токен" });
        }
      },

    async getById(req, res) {
        try {
            const { userID } = req.params
            const query = `SELECT * FROM Users WHERE UserID = $1;`
            const result = await pool.query(query, [userID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "User not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getAll(req, res) {
        try {
            const query = `SELECT * FROM Users;`
            const result = await pool.query(query)
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async update(req, res) {
        try {
            const { userID } = req.params
            const { firstName, middleName, lastName, phoneNumber, dateOfBirth, specialtyID, isActive } = req.body
        
            const query = `
            UPDATE Users 
            SET FirstName = $1, MiddleName = $2, LastName = $3, PhoneNumber = $4, DateOfBirth = $5, SpecialtyID = $6, IsActive = $7
            WHERE UserID = $8 RETURNING *;
            `;
            const values = [firstName, middleName, lastName, phoneNumber, dateOfBirth, specialtyID, isActive, userID]
            const result = await pool.query(query, values)
        
            if (!result.rows.length) {
            return res.status(404).json({ message: "User not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async delete(req, res) {
        try {
            const { userID } = req.params
            const query = `DELETE FROM Users WHERE UserID = $1 RETURNING *;`
            const result = await pool.query(query, [userID])

            if (!result.rows.length) {
                return res.status(404).json({ message: "User not found" })
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = userController
