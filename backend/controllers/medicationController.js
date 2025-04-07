const { pool } = require('../config/db')

const medicationController = {
    async create(req, res) {
        try {
            const { name, description, dosageRecommendations } = req.body
            const query = `
                INSERT INTO Medications (Name, Description, DosageRecommendations) 
                VALUES ($1, $2, $3) RETURNING *;
            `
            const values = [name, description, dosageRecommendations]
            const result = await pool.query(query, values)
            res.status(201).json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getById(req, res) {
        try {
            const { medicationID } = req.params
            const query = `SELECT * FROM Medications WHERE MedicationID = $1;`
            const result = await pool.query(query, [medicationID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Medication not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getAll(req, res) {
        try {
            const query = `SELECT * FROM Medications;`
            const result = await pool.query(query)
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async update(req, res) {
        try {
            const { medicationID } = req.params
            const { name, description, dosageRecommendations } = req.body
            const query = `
                UPDATE Medications 
                SET Name = $1, Description = $2, DosageRecommendations = $3 
                WHERE MedicationID = $4 RETURNING *;
            `
            const values = [name, description, dosageRecommendations, medicationID]
            const result = await pool.query(query, values)
            if (!result.rows.length) {
                return res.status(404).json({ message: "Medication not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async delete(req, res) {
        try {
            const { medicationID } = req.params
            const query = `DELETE FROM Medications WHERE MedicationID = $1 RETURNING *;`
            const result = await pool.query(query, [medicationID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Medication not found" })
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = medicationController
