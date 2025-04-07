const { pool } = require('../config/db')

const roleController = {
    async create(req, res) {
        try {
            const { roleName } = req.body
            const query = `
                INSERT INTO Roles (roleName) 
                VALUES ($1) RETURNING *;
            `
            const values = [roleName]
            const result = await pool.query(query, values)
            res.status(201).json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getById(req, res) {
        try {
            const { roleID } = req.params
            const query = `SELECT * FROM Roles WHERE roleID = $1;`
            const result = await pool.query(query, [roleID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Role not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getAll(req, res) {
        try {
            const query = `SELECT * FROM Roles;`
            const result = await pool.query(query)
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async update(req, res) {
        try {
            const { roleID } = req.params
            const { roleName } = req.body
            const query = `
                UPDATE Roles 
                SET roleName = $1
                WHERE roleID = $2 RETURNING *;
            `
            const values = [roleName, roleID]
            const result = await pool.query(query, values)
            if (!result.rows.length) {
                return res.status(404).json({ message: "Role not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async delete(req, res) {
        try {
            const { roleID } = req.params;
            const query = `DELETE FROM Roles WHERE roleID = $1 RETURNING *;`
            const result = await pool.query(query, [roleID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Role not found" })
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = roleController
