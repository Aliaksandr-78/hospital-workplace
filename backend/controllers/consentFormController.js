const { pool } = require('../config/db')

const consentFormController = {
    async create(req, res) {
        try {
            const { patientid, procedure, date, details } = req.body
            const query = `
                INSERT INTO ConsentForms (PatientID, Procedure, Date, Details) 
                VALUES ($1, $2, $3, $4) RETURNING *;
            `
            const values = [patientid, procedure, date, details]
            const result = await pool.query(query, values)
            res.status(201).json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getById(req, res) {
        try {
            const { consentFormID } = req.params
            const query = `SELECT * FROM ConsentForms WHERE ConsentFormID = $1;`
            const result = await pool.query(query, [consentFormID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Consent form not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getAll(req, res) {
        try {
            const query = `SELECT * FROM ConsentForms;`
            const result = await pool.query(query)
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async delete(req, res) {
        try {
            const { consentFormID } = req.params
            const query = `DELETE FROM ConsentForms WHERE ConsentFormID = $1 RETURNING *;`
            const result = await pool.query(query, [consentFormID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Consent form not found" })
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = consentFormController
