const { pool } = require('../config/db')

const medicationController = {
    async create(req, res) {
        try {
            const { 
                name, 
                description, 
                dosageRecommendations, 
                category, 
                contraindications, 
                sideEffects, 
                interactions, 
                isPrescriptionOnly, 
                rbRegistrationNumber 
            } = req.body
            
            const query = `
                INSERT INTO Medications (
                    Name, Description, DosageRecommendations, Category, 
                    Contraindications, SideEffects, Interactions, 
                    IsPrescriptionOnly, RBRegistrationNumber
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                RETURNING *;
            `
            const values = [
                name, 
                description, 
                dosageRecommendations, 
                category, 
                contraindications, 
                sideEffects, 
                interactions, 
                isPrescriptionOnly, 
                rbRegistrationNumber
            ]
            
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
            const { 
                name, 
                description, 
                dosageRecommendations, 
                category, 
                contraindications, 
                sideEffects, 
                interactions, 
                isPrescriptionOnly, 
                rbRegistrationNumber 
            } = req.body
            
            const query = `
                UPDATE Medications 
                SET 
                    Name = $1, 
                    Description = $2, 
                    DosageRecommendations = $3,
                    Category = $4,
                    Contraindications = $5,
                    SideEffects = $6,
                    Interactions = $7,
                    IsPrescriptionOnly = $8,
                    RBRegistrationNumber = $9
                WHERE MedicationID = $10 
                RETURNING *;
            `
            const values = [
                name, 
                description, 
                dosageRecommendations, 
                category, 
                contraindications, 
                sideEffects, 
                interactions, 
                isPrescriptionOnly, 
                rbRegistrationNumber,
                medicationID
            ]
            
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