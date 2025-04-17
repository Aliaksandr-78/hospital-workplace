const { pool } = require('../config/db');

const medicationContraindicationsController = {
    async create(req, res) {
        try {
            const { MedicationID, Condition, Severity, Description, RBReference } = req.body;
            
            const query = `
                INSERT INTO MedicationContraindications 
                (MedicationID, Condition, Severity, Description, RBReference) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *;
            `;
            
            const values = [
                MedicationID, 
                Condition, 
                Severity, 
                Description, 
                RBReference
            ];
            
            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]);
            
        } catch (error) {
            console.error("Ошибка при создании противопоказания:", error);
            res.status(500).json({ 
                error: "Не удалось создать противопоказание" 
            });
        }
    },

    async getById(req, res) {
        try {
            const { contraindicationID } = req.params;
            
            const query = `
                SELECT * FROM MedicationContraindications 
                WHERE ContraindicationID = $1;
            `;
            
            const result = await pool.query(query, [contraindicationID]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ 
                    message: "Противопоказание не найдено" 
                });
            }
            
            res.json(result.rows[0]);
            
        } catch (error) {
            console.error("Ошибка при получении противопоказания:", error);
            res.status(500).json({ 
                error: "Не удалось получить данные о противопоказании" 
            });
        }
    },

    async getByMedication(req, res) {
        try {
            const { medicationID } = req.params;
            
            const query = `
                SELECT 
                    mc.*,
                    m.Name AS MedicationName
                FROM MedicationContraindications mc
                JOIN Medications m ON mc.MedicationID = m.MedicationID
                WHERE mc.MedicationID = $1
                ORDER BY 
                    CASE Severity
                        WHEN 'высокая' THEN 1
                        WHEN 'средняя' THEN 2
                        WHEN 'низкая' THEN 3
                        ELSE 4
                    END;
            `;
            
            const result = await pool.query(query, [medicationID]);
            res.json(result.rows);
            
        } catch (error) {
            console.error("Ошибка при получении противопоказаний:", error);
            res.status(500).json({ 
                error: "Не удалось получить список противопоказаний" 
            });
        }
    },

    async update(req, res) {
        try {
            const { contraindicationID } = req.params;
            const { MedicationID, Condition, Severity, Description, RBReference } = req.body;
            
            const query = `
                UPDATE MedicationContraindications 
                SET 
                    MedicationID = $1,
                    Condition = $2,
                    Severity = $3,
                    Description = $4,
                    RBReference = $5
                WHERE ContraindicationID = $6
                RETURNING *;
            `;
            
            const values = [
                MedicationID, 
                Condition, 
                Severity, 
                Description, 
                RBReference, 
                contraindicationID
            ];
            
            const result = await pool.query(query, values);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ 
                    message: "Противопоказание не найдено" 
                });
            }
            
            res.json(result.rows[0]);
            
        } catch (error) {
            console.error("Ошибка при обновлении противопоказания:", error);
            res.status(500).json({ 
                error: "Не удалось обновить противопоказание" 
            });
        }
    },

    async delete(req, res) {
        try {
            const { contraindicationID } = req.params;
            
            // Сначала проверим существование записи
            const checkQuery = `
                SELECT 1 FROM MedicationContraindications 
                WHERE ContraindicationID = $1;
            `;
            const checkResult = await pool.query(checkQuery, [contraindicationID]);
            
            if (checkResult.rows.length === 0) {
                return res.status(200).json({ 
                    message: "Противопоказание не найдено (возможно уже удалено)" 
                });
            }
            
            // Удаление записи
            const deleteQuery = `
                DELETE FROM MedicationContraindications 
                WHERE ContraindicationID = $1
                RETURNING *;
            `;
            const deleteResult = await pool.query(deleteQuery, [contraindicationID]);
            
            res.json({ 
                success: true,
                message: "Противопоказание успешно удалено",
                data: deleteResult.rows[0]
            });
            
        } catch (error) {
            console.error("Ошибка при удалении противопоказания:", error);
            res.status(500).json({ 
                error: "Не удалось удалить противопоказание" 
            });
        }
    }
};

module.exports = medicationContraindicationsController;