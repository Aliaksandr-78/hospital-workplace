const { pool } = require('../config/db')

const labTestCatalogController = {
    async create(req, res) {
        try {
            const { name, methodology, cost } = req.body
            const query = `
                INSERT INTO LabTestCatalog (Name, Methodology, Cost) 
                VALUES ($1, $2, $3) RETURNING *;
            `
            const values = [name, methodology, cost]
            const result = await pool.query(query, values)
            res.status(201).json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getById(req, res) {
        try {
            const { testID } = req.params
            const query = `SELECT * FROM LabTestCatalog WHERE TestID = $1;`
            const result = await pool.query(query, [testID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Test not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getAll(req, res) {
        try {
            const query = `SELECT * FROM LabTestCatalog;`
            const result = await pool.query(query)
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async update(req, res) {
        try {
            const { testID } = req.params
            const { name, methodology, cost } = req.body
            const query = `
                UPDATE LabTestCatalog 
                SET Name = $1, Methodology = $2, Cost = $3 
                WHERE TestID = $4 RETURNING *;
            `
            const values = [name, methodology, cost, testID]
            const result = await pool.query(query, values)
            if (!result.rows.length) {
                return res.status(404).json({ message: "Test not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async delete(req, res) {
        try {
            const { testID } = req.params
            const query = `DELETE FROM LabTestCatalog WHERE TestID = $1 RETURNING *;`
            const result = await pool.query(query, [testID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Test not found" })
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = labTestCatalogController
