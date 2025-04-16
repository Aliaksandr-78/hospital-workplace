const { pool } = require('../config/db')

const prescriptionController = {
    async create(req, res) {
        try {
            const { 
                patientID, 
                doctorID, 
                medicationID, 
                dosage, 
                instructions,
                isAIRecommended,
                AIRecommendationScore,
                AIContraindicationsChecked,
                RBProtocolCompliant 
            } = req.body
            
            const query = `
                INSERT INTO Prescriptions (
                    PatientID, DoctorID, MedicationID, Dosage, Instructions,
                    IsAIRecommended, AIRecommendationScore, AIContraindicationsChecked, RBProtocolCompliant
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                RETURNING *;
            `
            const values = [
                patientID, 
                doctorID, 
                medicationID, 
                dosage, 
                instructions,
                isAIRecommended || false,
                AIRecommendationScore || null,
                AIContraindicationsChecked || false,
                RBProtocolCompliant === undefined ? true : RBProtocolCompliant
            ]
            
            const result = await pool.query(query, values)
            res.status(201).json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getById(req, res) {
        try {
            const { prescriptionID } = req.params
            const query = `
                SELECT p.*, 
                       pat.Name AS PatientName,
                       u.Name AS DoctorName,
                       m.Name AS MedicationName
                FROM Prescriptions p
                LEFT JOIN Patients pat ON p.PatientID = pat.PatientID
                LEFT JOIN Users u ON p.DoctorID = u.UserID
                LEFT JOIN Medications m ON p.MedicationID = m.MedicationID
                WHERE p.PrescriptionID = $1;
            `
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
            const query = `
                SELECT p.*, 
                       pat.Name AS PatientName,
                       u.Name AS DoctorName,
                       m.Name AS MedicationName
                FROM Prescriptions p
                LEFT JOIN Patients pat ON p.PatientID = pat.PatientID
                LEFT JOIN Users u ON p.DoctorID = u.UserID
                LEFT JOIN Medications m ON p.MedicationID = m.MedicationID;
            `
            const result = await pool.query(query)
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async update(req, res) {
        try {
            const { prescriptionID } = req.params
            const { 
                patientID, 
                doctorID, 
                medicationID, 
                dosage, 
                instructions,
                isAIRecommended,
                AIRecommendationScore,
                AIContraindicationsChecked,
                RBProtocolCompliant 
            } = req.body
            
            const query = `
                UPDATE Prescriptions 
                SET 
                    PatientID = $1, 
                    DoctorID = $2, 
                    MedicationID = $3, 
                    Dosage = $4, 
                    Instructions = $5,
                    IsAIRecommended = $6,
                    AIRecommendationScore = $7,
                    AIContraindicationsChecked = $8,
                    RBProtocolCompliant = $9
                WHERE PrescriptionID = $10 
                RETURNING *;
            `
            const values = [
                patientID, 
                doctorID, 
                medicationID, 
                dosage, 
                instructions,
                isAIRecommended,
                AIRecommendationScore,
                AIContraindicationsChecked,
                RBProtocolCompliant,
                prescriptionID
            ]
            
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
    },
}

module.exports = prescriptionController