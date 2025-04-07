const { pool } = require('../config/db')

const medicalCertificateController = {
    async create(req, res) {
        try {
            const { patientID, issuedBy, issuedDate, certificateType, details } = req.body
            const query = `
                INSERT INTO MedicalCertificates (PatientID, IssuedBy, IssuedDate, CertificateType, Details) 
                VALUES ($1, $2, $3, $4, $5) RETURNING *;
            `
            const values = [patientID, issuedBy, issuedDate, certificateType, details]
            const result = await pool.query(query, values)
            res.status(201).json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getById(req, res) {
        try {
            const { certificateID } = req.params
            const query = `SELECT * FROM MedicalCertificates WHERE CertificateID = $1;`
            const result = await pool.query(query, [certificateID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Medical certificate not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getAll(req, res) {
        try {
            const query = `SELECT * FROM MedicalCertificates;`
            const result = await pool.query(query)
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async update(req, res) {
        try {
            const { certificateID } = req.params
            const { patientID, issuedBy, issuedDate, certificateType, details } = req.body
            const query = `
                UPDATE MedicalCertificates 
                SET PatientID = $1, IssuedBy = $2, IssuedDate = $3, CertificateType = $4, Details = $5 
                WHERE CertificateID = $6 RETURNING *;
            `
            const values = [patientID, issuedBy, issuedDate, certificateType, details, certificateID]
            const result = await pool.query(query, values)
            if (!result.rows.length) {
                return res.status(404).json({ message: "Medical certificate not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async delete(req, res) {
        try {
            const { certificateID } = req.params
            const query = `DELETE FROM MedicalCertificates WHERE CertificateID = $1 RETURNING *;`
            const result = await pool.query(query, [certificateID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Medical certificate not found" })
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = medicalCertificateController
