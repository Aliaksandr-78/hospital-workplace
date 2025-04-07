const { pool } = require('../config/db')

const prescriptionController = {
    async create(req, res) {
        try {
            const { patientID, doctorID, medicationID, dosage, instructions } = req.body
            const query = `
                INSERT INTO Prescriptions (PatientID, DoctorID, MedicationID, Dosage, Instructions) 
                VALUES ($1, $2, $3, $4, $5) RETURNING *;
            `
            const values = [patientID, doctorID, medicationID, dosage, instructions]
            const result = await pool.query(query, values)
            res.status(201).json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getById(req, res) {
        try {
            const { prescriptionID } = req.params
            const query = `SELECT * FROM Prescriptions WHERE PrescriptionID = $1;`
            const result = await pool.query(query, [prescriptionID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Prescription not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getAll(req, res) {
        try {
            const query = `SELECT * FROM Prescriptions;`
            const result = await pool.query(query)
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async update(req, res) {
        try {
            const { prescriptionID } = req.params
            const { patientID, doctorID, medicationID, dosage, instructions } = req.body
            const query = `
                UPDATE Prescriptions 
                SET PatientID = $1, DoctorID = $2, MedicationID = $3, Dosage = $4, Instructions = $5
                WHERE PrescriptionID = $6 RETURNING *;
            `
            const values = [patientID, doctorID, medicationID, dosage, instructions, prescriptionID]
            const result = await pool.query(query, values)
            if (!result.rows.length) {
                return res.status(404).json({ message: "Prescription not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async delete(req, res) {
        try {
            const { prescriptionID } = req.params
            const query = `DELETE FROM Prescriptions WHERE PrescriptionID = $1 RETURNING *;`
            const result = await pool.query(query, [prescriptionID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Prescription not found" })
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = prescriptionController