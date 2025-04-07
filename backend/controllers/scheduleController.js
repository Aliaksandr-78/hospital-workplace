const { pool } = require('../config/db')

const scheduleController = {
    async create(req, res) {
        try {
          const { doctorID, date, startTime, endTime, eventTypeID } = req.body;
    
          // Проверка, что все обязательные поля присутствуют
          if (!doctorID || !date || !startTime || !endTime || !eventTypeID) {
            return res.status(400).json({ error: "Все поля обязательны для заполнения." });
          }
    
          const query = `
            INSERT INTO Schedules (doctorID, date, startTime, endTime, eventTypeID) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
          `;
          const values = [doctorID, date, startTime, endTime, eventTypeID];
          const result = await pool.query(query, values);
          res.status(201).json(result.rows[0]);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },

    async getById(req, res) {
        try {
            const { scheduleID } = req.params
            const query = `
                SELECT Schedules.*, EventTypes.EventName 
                FROM Schedules 
                LEFT JOIN EventTypes ON Schedules.EventTypeID = EventTypes.EventTypeID 
                WHERE scheduleID = $1;
            `
            const result = await pool.query(query, [scheduleID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Schedule not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getAll(req, res) {
        try {
            const query = `
                SELECT Schedules.*, EventTypes.EventName 
                FROM Schedules 
                LEFT JOIN EventTypes ON Schedules.EventTypeID = EventTypes.EventTypeID;
            `
            const result = await pool.query(query)
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async update(req, res) {
        try {
            const { scheduleID } = req.params
            const { doctorID, date, startTime, endTime, eventTypeID } = req.body
            const query = `
                UPDATE Schedules 
                SET doctorID = $1, date = $2, startTime = $3, endTime = $4, eventTypeID = $5 
                WHERE scheduleID = $6 RETURNING *;
            `
            const values = [doctorID, date, startTime, endTime, eventTypeID, scheduleID]
            const result = await pool.query(query, values)
            if (!result.rows.length) {
                return res.status(404).json({ message: "Schedule not found" })
            }
            res.json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async delete(req, res) {
        try {
            const { scheduleID } = req.params
            const query = `DELETE FROM Schedules WHERE scheduleID = $1 RETURNING *;`
            const result = await pool.query(query, [scheduleID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Schedule not found" })
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = scheduleController