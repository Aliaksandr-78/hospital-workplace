const { pool } = require('../config/db')

const medicalDischargeController = {
    async create(req, res) {
        try {
            const { PatientID, DoctorID, DischargeDate, Summary } = req.body
            const query = `
                INSERT INTO MedicalDischarges (PatientID, DoctorID, DischargeDate, Summary) 
                VALUES ($1, $2, $3, $4) RETURNING *;
            `
            const values = [PatientID, DoctorID, DischargeDate, Summary]
            const result = await pool.query(query, values)
            res.status(201).json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getById(req, res) {
        try {
            const { dischargeID } = req.params
            const query = `SELECT * FROM MedicalDischarges WHERE DischargeID = $1;`
            const result = await pool.query(query, [dischargeID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Medical discharge not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getAll(req, res) {
        try {
            const query = `SELECT * FROM MedicalDischarges;`
            const result = await pool.query(query)
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async update(req, res) {
        try {
            const { dischargeID } = req.params
            const { PatientID, DoctorID, DischargeDate, Summary } = req.body
            const query = `
                UPDATE MedicalDischarges 
                SET PatientID = $1, DoctorID = $2, DischargeDate = $3, Summary = $4 
                WHERE DischargeID = $5 RETURNING *;
            `
            const values = [PatientID, DoctorID, DischargeDate, Summary, dischargeID]
            const result = await pool.query(query, values)
            if (!result.rows.length) {
                return res.status(404).json({ message: "Medical discharge not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async delete(req, res) {
        try {
            const { dischargeID } = req.params
            const query = `DELETE FROM MedicalDischarges WHERE DischargeID = $1 RETURNING *;`
            const result = await pool.query(query, [dischargeID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Medical discharge not found" })
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = medicalDischargeController
