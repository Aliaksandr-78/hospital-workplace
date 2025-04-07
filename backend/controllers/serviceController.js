const { pool } = require('../config/db')

const serviceController = {
    async create(req, res) {
        try {
            const { name, description, cost } = req.body
            const query = `
                INSERT INTO Services (name, description, cost) 
                VALUES ($1, $2, $3) RETURNING *;
            `
            const values = [name, description, cost]
            const result = await pool.query(query, values)
            res.status(201).json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getById(req, res) {
        try {
            const { serviceID } = req.params
            const query = `SELECT * FROM Services WHERE serviceID = $1;`
            const result = await pool.query(query, [serviceID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Service not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getAll(req, res) {
        try {
            const query = `SELECT * FROM Services;`
            const result = await pool.query(query)
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async update(req, res) {
        try {
            const { serviceID } = req.params
            const { name, description, cost } = req.body
            const query = `
                UPDATE Services 
                SET name = $1, description = $2, cost = $3 
                WHERE serviceID = $4 RETURNING *;
            `
            const values = [name, description, cost, serviceID]
            const result = await pool.query(query, values)
            if (!result.rows.length) {
                return res.status(404).json({ message: "Service not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async delete(req, res) {
        try {
            const { serviceID } = req.params
            const query = `DELETE FROM Services WHERE serviceID = $1 RETURNING *;`
            const result = await pool.query(query, [serviceID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Service not found" })
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = serviceController
