const { pool } = require('../config/db')

const medicalRecordController = {
    async create(req, res) {
        try {
            const { patientID, diagnosis, treatmentPlan, labResults } = req.body
            const query = `
                INSERT INTO MedicalRecords (PatientID, Diagnosis, TreatmentPlan, LabResults) 
                VALUES ($1, $2, $3, $4) RETURNING *;
            `
            const values = [patientID, diagnosis, treatmentPlan, labResults]
            const result = await pool.query(query, values)
            res.status(201).json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getById(req, res) {
        try {
            const { recordID } = req.params
            const query = `SELECT * FROM MedicalRecords WHERE RecordID = $1;`
            const result = await pool.query(query, [recordID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Medical record not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getAll(req, res) {
        try {
            const query = `SELECT * FROM MedicalRecords;`
            const result = await pool.query(query)
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async update(req, res) {
        try {
            const { recordID } = req.params
            const { patientID, diagnosis, treatmentPlan, labResults } = req.body
            const query = `
                UPDATE MedicalRecords 
                SET PatientID = $1, Diagnosis = $2, TreatmentPlan = $3, LabResults = $4
                WHERE RecordID = $5 RETURNING *;
            `
            const values = [patientID, diagnosis, treatmentPlan, labResults, recordID]
            const result = await pool.query(query, values)
            if (!result.rows.length) {
                return res.status(404).json({ message: "Medical record not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async delete(req, res) {
        try {
            const { recordID } = req.params
            const query = `DELETE FROM MedicalRecords WHERE RecordID = $1 RETURNING *;`
            const result = await pool.query(query, [recordID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Medical record not found" })
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = medicalRecordController
