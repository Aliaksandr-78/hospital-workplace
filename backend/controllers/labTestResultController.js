const { pool } = require('../config/db');

const labTestResultController = {
    /**
     * Создание нового результата теста
     */
    async create(req, res) {
        try {
            const { 
                patientID, 
                testID, 
                orderedBy, 
                performedBy, 
                resultValue, 
                referenceRange, 
                interpretation, 
                status 
            } = req.body;

            const query = `
                INSERT INTO LabTestResults 
                (PatientID, TestID, OrderedBy, PerformedBy, ResultValue, 
                 ReferenceRange, Interpretation, Status) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING *;
            `;
            
            const values = [
                patientID, 
                testID, 
                orderedBy, 
                performedBy, 
                resultValue, 
                referenceRange, 
                interpretation, 
                status
            ];
            
            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Получение результата теста по ID
     */
    async getById(req, res) {
        try {
            const { resultID } = req.params;
            const query = `SELECT * FROM LabTestResults WHERE ResultID = $1;`;
            
            const result = await pool.query(query, [resultID]);
            
            if (!result.rows.length) {
                return res.status(404).json({ message: "Результат теста не найден" });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Получение всех результатов тестов
     */
    async getAll(req, res) {
        try {
            const query = `SELECT * FROM LabTestResults ORDER BY OrderDate DESC;`;
            const result = await pool.query(query);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Получение всех результатов тестов для пациента
     */
    async getByPatientAll(req, res) {
        try {
            const { patientID } = req.params;
            const query = `
                SELECT * FROM LabTestResults 
                WHERE PatientID = $1
                ORDER BY OrderDate DESC;
            `;
            
            const result = await pool.query(query, [patientID]);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Обновление результата теста
     */
    async update(req, res) {
        try {
            const { resultID } = req.params;
            const { 
                resultValue, 
                referenceRange, 
                interpretation, 
                status,
                performedBy,
                resultDate
            } = req.body;
            
            const query = `
                UPDATE LabTestResults 
                SET 
                    ResultValue = $1,
                    ReferenceRange = $2,
                    Interpretation = $3,
                    Status = $4,
                    PerformedBy = $5,
                    ResultDate = $6
                WHERE ResultID = $7 
                RETURNING *;
            `;
            
            const values = [
                resultValue, 
                referenceRange, 
                interpretation, 
                status,
                performedBy,
                resultDate,
                resultID
            ];
            
            const result = await pool.query(query, values);
            
            if (!result.rows.length) {
                return res.status(404).json({ message: "Результат теста не найден" });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Удаление результата теста
     */
    async delete(req, res) {
        try {
            const { resultID } = req.params;
            const query = `
                DELETE FROM LabTestResults 
                WHERE ResultID = $1 
                RETURNING *;
            `;
            
            const result = await pool.query(query, [resultID]);
            
            if (!result.rows.length) {
                return res.status(404).json({ message: "Результат теста не найден" });
            }
            
            res.json({ 
                message: "Результат теста успешно удален", 
                data: result.rows[0] 
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = labTestResultController;