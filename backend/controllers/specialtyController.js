const { pool } = require('../config/db')

const specialtyController = {
    async create(req, res) {
        try {
            const { specialtyName, description } = req.body
            const query = `
                INSERT INTO Specialties (specialtyName, description) 
                VALUES ($1, $2) RETURNING *;
            `
            const values = [specialtyName, description]
            const result = await pool.query(query, values)
            res.status(201).json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getById(req, res) {
        try {
            const { specialtyID } = req.params
            const query = `SELECT * FROM Specialties WHERE specialtyID = $1;`
            const result = await pool.query(query, [specialtyID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Specialty not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getAll(req, res) {
        try {
            const query = `SELECT * FROM Specialties;`
            const result = await pool.query(query)
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async update(req, res) {
        try {
            const { specialtyID } = req.params
            const { specialtyName, description } = req.body
            const query = `
                UPDATE Specialties 
                SET specialtyName = $1, description = $2 
                WHERE specialtyID = $3 RETURNING *;
            `
            const values = [specialtyName, description, specialtyID]
            const result = await pool.query(query, values)
            if (!result.rows.length) {
                return res.status(404).json({ message: "Specialty not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async delete(req, res) {
        try {
            const { specialtyID } = req.params
            const query = `DELETE FROM Specialties WHERE specialtyID = $1 RETURNING *;`
            const result = await pool.query(query, [specialtyID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Specialty not found" })
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = specialtyController
