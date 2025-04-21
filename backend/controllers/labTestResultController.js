const { pool } = require('../config/db');

const labTestResultController = {
    /**
     * Создание нового результата теста
     */
    async create(req, res) {
        try {
            const { 
                patientID: patientId, 
                testID: testId, 
                orderedBy: orderedBy, 
                performedBy, 
                resultValue, 
                referenceRange, 
                interpretation, 
                status 
            } = req.body;
    
            // Проверка обязательных полей
            if (!patientId || !testId || !orderedBy) {
                return res.status(400).json({ error: 'Необходимо указать patientID, testID и orderedBy' });
            }
    
            const query = `
                INSERT INTO LabTestResults 
                (PatientID, TestID, OrderedBy, PerformedBy, ResultValue, 
                 ReferenceRange, Interpretation, Status, OrderDate) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
                RETURNING *;
            `;
            
            const values = [
                patientId, 
                testId, 
                orderedBy, 
                performedBy || null, 
                resultValue || null, 
                referenceRange || null, 
                interpretation || null, 
                status || 'ordered'
            ];
            
            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Ошибка при создании результата теста:', error);
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
                SELECT 
                    ltr.*,
                    ltc.Name AS TestName
                FROM LabTestResults ltr
                LEFT JOIN LabTestCatalog ltc ON ltr.TestID = ltc.TestID
                WHERE ltr.PatientID = $1
                ORDER BY ltr.OrderDate DESC;
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