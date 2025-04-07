const { pool } = require('../config/db')

const patientController = {
    async create(req, res) {
        try {
            const { firstName, middleName, lastName, dateOfBirth, gender, phoneNumber, email, address } = req.body
            const query = `
                INSERT INTO Patients (FirstName, MiddleName, LastName, DateOfBirth, Gender, PhoneNumber, Email, Address) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
            `
            const values = [firstName, middleName, lastName, dateOfBirth, gender, phoneNumber, email, address]
            const result = await pool.query(query, values)
            res.status(201).json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getById(req, res) {
        try {
            const { patientID } = req.params
            const query = `SELECT * FROM Patients WHERE PatientID = $1;`
            const result = await pool.query(query, [patientID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Patient not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getAll(req, res) {
        try {
            const query = `SELECT * FROM Patients;`
            const result = await pool.query(query)
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async update(req, res) {
        try {
            const { patientID } = req.params
            const { firstName, middleName, lastName, dateOfBirth, gender, phoneNumber, email, address } = req.body
            const query = `
                UPDATE Patients 
                SET FirstName = $1, MiddleName = $2, LastName = $3, DateOfBirth = $4, Gender = $5, PhoneNumber = $6, Email = $7, Address = $8 
                WHERE PatientID = $9 RETURNING *;
            `
            const values = [firstName, middleName, lastName, dateOfBirth, gender, phoneNumber, email, address, patientID]
            const result = await pool.query(query, values)
            if (!result.rows.length) {
                return res.status(404).json({ message: "Patient not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async delete(req, res) {
        try {
            const { patientID } = req.params
            const query = `DELETE FROM Patients WHERE PatientID = $1 RETURNING *;`
            const result = await pool.query(query, [patientID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Patient not found" })
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = patientController
