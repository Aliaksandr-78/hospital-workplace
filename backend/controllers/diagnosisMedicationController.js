const { pool } = require('../config/db');

const diagnosisMedicationController = {
    async create(req, res) {
        try {
            const { DiagnosisID, MedicationID, Confidence, IsFirstLine, ProtocolReference } = req.body;
            const query = `
                INSERT INTO DiagnosisMedication 
                (DiagnosisID, MedicationID, Confidence, IsFirstLine, ProtocolReference) 
                VALUES ($1, $2, $3, $4, $5) RETURNING *;
            `;
            const values = [DiagnosisID, MedicationID, Confidence, IsFirstLine, ProtocolReference];
            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // diagnosisMedicationController.js
    async getByDiagnosis(req, res) {
        try {
          const { diagnosisID } = req.params;
          const query = `
            SELECT 
              dm.diagnosisid as "diagnosisId",
              dm.medicationid as "medicationId",
              dm.confidence,
              dm.isfirstline as "isFirstLine",
              dm.protocolreference as "protocolReference",
              m.name as "medicationName",
              m.description as "medicationDescription",
              m.rbregistrationnumber as "registrationNumber"
            FROM diagnosismedication dm
            LEFT JOIN medications m ON dm.medicationid = m.medicationid
            WHERE dm.diagnosisid = $1;
          `;
          const result = await pool.query(query, [diagnosisID]);
          res.json(result.rows);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },

    async update(req, res) {
        try {
            const { diagnosisID, medicationID } = req.params;
            const { Confidence, IsFirstLine, ProtocolReference } = req.body;
            const query = `
                UPDATE DiagnosisMedication 
                SET Confidence = $1,
                    IsFirstLine = $2,
                    ProtocolReference = $3
                WHERE DiagnosisID = $4 AND MedicationID = $5 
                RETURNING *;
            `;
            const values = [Confidence, IsFirstLine, ProtocolReference, diagnosisID, medicationID];
            const result = await pool.query(query, values);
            if (!result.rows.length) {
                return res.status(404).json({ message: "Association not found" });
            }
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async delete(req, res) {
        try {
            const { diagnosisID, medicationID } = req.params;
            const query = `
                DELETE FROM DiagnosisMedication 
                WHERE DiagnosisID = $1 AND MedicationID = $2 
                RETURNING *;
            `;
            const result = await pool.query(query, [diagnosisID, medicationID]);
            if (!result.rows.length) {
                return res.status(404).json({ message: "Association not found" });
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = diagnosisMedicationController;