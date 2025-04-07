const { pool } = require('../config/db')

const appointmentServiceController = {
    async addServiceToAppointment(req, res) {
        try {
            const { appointmentID, serviceID } = req.body
            const query = `
                INSERT INTO AppointmentServices (AppointmentID, ServiceID) 
                VALUES ($1, $2) RETURNING *;
            `
            const values = [appointmentID, serviceID]
            const result = await pool.query(query, values)
            
            res.status(201).json(result.rows[0])
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getServicesByAppointment(req, res) {
        try {
            const { appointmentID } = req.params
            const query = `SELECT * FROM AppointmentServices WHERE AppointmentID = $1;`
            const result = await pool.query(query, [appointmentID])
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async removeServiceFromAppointment(req, res) {
        try {
            const { appointmentServiceID } = req.params
            const query = `DELETE FROM AppointmentServices WHERE AppointmentServiceID = $1 RETURNING *;`
            const result = await pool.query(query, [appointmentServiceID])

            if (!result.rows.length) {
                return res.status(404).json({ message: "Appointment service not found" })
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = appointmentServiceController
