const { pool } = require('../config/db');

const diagnosisController = {
    async create(req, res) {
        try {
            const { ICD10Code, Name, Description, Symptoms, RBClinicalGuidelines } = req.body;
            const query = `
                INSERT INTO Diagnoses (ICD10Code, Name, Description, Symptoms, RBClinicalGuidelines) 
                VALUES ($1, $2, $3, $4, $5) RETURNING *;
            `;
            const values = [ICD10Code, Name, Description, Symptoms, RBClinicalGuidelines];
            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getById(req, res) {
        try {
            const { diagnosisID } = req.params;
            const query = `SELECT * FROM Diagnoses WHERE DiagnosisID = $1;`;
            const result = await pool.query(query, [diagnosisID]);
            if (!result.rows.length) {
                return res.status(404).json({ message: "Diagnosis not found" });
            }
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAll(req, res) {
        try {
            const query = `SELECT * FROM Diagnoses;`;
            const result = await pool.query(query);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async update(req, res) {
        try {
            const { diagnosisID } = req.params;
            const { ICD10Code, Name, Description, Symptoms, RBClinicalGuidelines } = req.body;
            const query = `
                UPDATE Diagnoses 
                SET ICD10Code = $1,
                    Name = $2,
                    Description = $3,
                    Symptoms = $4,
                    RBClinicalGuidelines = $5
                WHERE DiagnosisID = $6 RETURNING *;
            `;
            const values = [ICD10Code, Name, Description, Symptoms, RBClinicalGuidelines, diagnosisID];
            const result = await pool.query(query, values);
            if (!result.rows.length) {
                return res.status(404).json({ message: "Diagnosis not found" });
            }
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async delete(req, res) {
        try {
            const { diagnosisID } = req.params;
            const query = `DELETE FROM Diagnoses WHERE DiagnosisID = $1 RETURNING *;`;
            const result = await pool.query(query, [diagnosisID]);
            if (!result.rows.length) {
                return res.status(404).json({ message: "Diagnosis not found" });
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = diagnosisController;