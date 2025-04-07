const { pool } = require('../config/db')

const eventTypeController = {
    // Создание нового типа события
    async create(req, res) {
        try {
            const { eventName } = req.body
            const query = `
                INSERT INTO EventTypes (EventName) 
                VALUES ($1) RETURNING *;
            `
            const values = [eventName]
            const result = await pool.query(query, values)
            res.status(201).json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    // Получение типа события по ID
    async getById(req, res) {
        try {
            const { eventTypeID } = req.params
            const query = `SELECT * FROM EventTypes WHERE EventTypeID = $1;`
            const result = await pool.query(query, [eventTypeID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Event type not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    // Получение всех типов событий
    async getAll(req, res) {
        try {
            const query = `SELECT * FROM EventTypes;`
            const result = await pool.query(query)
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    // Обновление типа события
    async update(req, res) {
        try {
            const { eventTypeID } = req.params
            const { eventName } = req.body
            const query = `
                UPDATE EventTypes 
                SET EventName = $1
                WHERE EventTypeID = $2 RETURNING *;
            `
            const values = [eventName, eventTypeID]
            const result = await pool.query(query, values)
            if (!result.rows.length) {
                return res.status(404).json({ message: "Event type not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    // Удаление типа события
    async delete(req, res) {
        try {
            const { eventTypeID } = req.params;
            const query = `DELETE FROM EventTypes WHERE EventTypeID = $1 RETURNING *;`
            const result = await pool.query(query, [eventTypeID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Event type not found" })
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = eventTypeController