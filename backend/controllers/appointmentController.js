const { pool } = require('../config/db');

const appointmentController = {
    async create(req, res) {
        try {
            const { patientid, doctorid, date, time, reason } = req.body;

            // Создаем запись
            const createQuery = `
                INSERT INTO Appointments (patientID, doctorID, date, time, reason)
                VALUES ($1, $2, $3, $4, $5) RETURNING *;
            `;
            const values = [patientid, doctorid, date, time, reason];
            const result = await pool.query(createQuery, values);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("Ошибка при создании приема:", error);
            res.status(500).json({ error: error.message });
        }
    },

    async getById(req, res) {
        try {
            const { appointmentID } = req.params;
            const query = `SELECT * FROM Appointments WHERE appointmentID = $1;`;
            const result = await pool.query(query, [appointmentID]);
            if (!result.rows.length) {
                return res.status(404).json({ message: "Appointment not found" });
            }
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAll(req, res) {
        try {
            const query = `SELECT * FROM Appointments;`;
            const result = await pool.query(query);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async update(req, res) {
        try {
            const { appointmentID } = req.params;
            const { patientid, doctorid, date, time, reason } = req.body;
            const query = `
                UPDATE Appointments
                SET patientID = $2, doctorID = $3, date = $4, time = $5, reason = $6
                WHERE appointmentID = $1 RETURNING *;
            `;
            const values = [appointmentID, patientid, doctorid, date, time, reason];
            const result = await pool.query(query, values);
            if (!result.rows.length) {
                return res.status(404).json({ message: "Appointment not found" });
            }
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async delete(req, res) {
        try {
            const { appointmentID } = req.params;
            const query = `DELETE FROM Appointments WHERE appointmentID = $1 RETURNING *;`;
            const result = await pool.query(query, [appointmentID]);
            if (!result.rows.length) {
                return res.status(404).json({ message: "Appointment not found" });
            }
            res.json({ message: "Appointment deleted", appointment: result.rows[0] });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = appointmentController;