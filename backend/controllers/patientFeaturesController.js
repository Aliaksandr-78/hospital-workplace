const { pool } = require('../config/db');

const patientFeaturesController = {
    async create(req, res) {
        try {
            const { PatientID, FeatureType, FeatureValue, DateIdentified, IsActive } = req.body;
            
            // Проверка на дубликаты
            const checkQuery = `
                SELECT 1 FROM PatientFeatures 
                WHERE PatientID = $1 AND FeatureType = $2 AND FeatureValue = $3;
            `;
            const checkResult = await pool.query(checkQuery, [PatientID, FeatureType, FeatureValue]);
            
            if (checkResult.rows.length > 0) {
                return res.status(400).json({ 
                    error: "Такая особенность пациента уже существует" 
                });
            }

            const query = `
                INSERT INTO PatientFeatures 
                (PatientID, FeatureType, FeatureValue, DateIdentified, IsActive) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *;
            `;
            
            const values = [
                PatientID, 
                FeatureType, 
                FeatureValue, 
                DateIdentified || null, 
                IsActive !== undefined ? IsActive : true
            ];
            
            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]);
            
        } catch (error) {
            console.error("Ошибка при создании особенности пациента:", error);
            res.status(500).json({ 
                error: "Не удалось создать особенность пациента" 
            });
        }
    },

    async getById(req, res) {
        try {
            const { featureID } = req.params;
            
            const query = `
                SELECT 
                    pf.*,
                    p.FirstName || ' ' || p.LastName AS PatientName
                FROM PatientFeatures pf
                JOIN Patients p ON pf.PatientID = p.PatientID
                WHERE pf.FeatureID = $1;
            `;
            
            const result = await pool.query(query, [featureID]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ 
                    message: "Особенность пациента не найдена" 
                });
            }
            
            res.json(result.rows[0]);
            
        } catch (error) {
            console.error("Ошибка при получении особенности пациента:", error);
            res.status(500).json({ 
                error: "Не удалось получить данные об особенности пациента" 
            });
        }
    },

    async getByPatient(req, res) {
        try {
            const { patientID } = req.params;
            
            const query = `
                SELECT 
                    pf.*,
                    p.FirstName || ' ' || p.LastName AS PatientName
                FROM PatientFeatures pf
                JOIN Patients p ON pf.PatientID = p.PatientID
                WHERE pf.PatientID = $1
                ORDER BY 
                    CASE FeatureType
                        WHEN 'аллергии' THEN 1
                        WHEN 'непереносимость' THEN 2
                        WHEN 'заболевания' THEN 3
                        WHEN 'патологические состояния' THEN 4
                        ELSE 5
                    END,
                    FeatureValue;
            `;
            
            const result = await pool.query(query, [patientID]);
            res.json(result.rows);
            
        } catch (error) {
            console.error("Ошибка при получении особенностей пациента:", error);
            res.status(500).json({ 
                error: "Не удалось получить список особенностей пациента" 
            });
        }
    },

    async update(req, res) {
        try {
            const { featureID } = req.params;
            const { FeatureType, FeatureValue, DateIdentified, IsActive } = req.body;
            
            // Проверка существования записи
            const checkQuery = `
                SELECT PatientID FROM PatientFeatures 
                WHERE FeatureID = $1;
            `;
            const checkResult = await pool.query(checkQuery, [featureID]);
            
            if (checkResult.rows.length === 0) {
                return res.status(404).json({ 
                    message: "Особенность пациента не найдена" 
                });
            }
            
            // Проверка на дубликаты
            const duplicateQuery = `
                SELECT 1 FROM PatientFeatures 
                WHERE PatientID = $1 AND FeatureType = $2 AND FeatureValue = $3 AND FeatureID != $4;
            `;
            const duplicateResult = await pool.query(duplicateQuery, [
                checkResult.rows[0].patientid,
                FeatureType,
                FeatureValue,
                featureID
            ]);
            
            if (duplicateResult.rows.length > 0) {
                return res.status(400).json({ 
                    error: "Такая особенность пациента уже существует" 
                });
            }

            const query = `
                UPDATE PatientFeatures 
                SET 
                    FeatureType = $1,
                    FeatureValue = $2,
                    DateIdentified = $3,
                    IsActive = $4
                WHERE FeatureID = $5
                RETURNING *;
            `;
            
            const values = [
                FeatureType, 
                FeatureValue, 
                DateIdentified || null, 
                IsActive !== undefined ? IsActive : true,
                featureID
            ];
            
            const result = await pool.query(query, values);
            res.json(result.rows[0]);
            
        } catch (error) {
            console.error("Ошибка при обновлении особенности пациента:", error);
            res.status(500).json({ 
                error: "Не удалось обновить особенность пациента" 
            });
        }
    },

    async delete(req, res) {
        try {
            const { featureID } = req.params;
            
            // Сначала проверим существование записи
            const checkQuery = `
                SELECT 1 FROM PatientFeatures 
                WHERE FeatureID = $1;
            `;
            const checkResult = await pool.query(checkQuery, [featureID]);
            
            if (checkResult.rows.length === 0) {
                return res.status(200).json({ 
                    message: "Особенность не найдена (возможно уже удалена)" 
                });
            }
            
            // Удаление записи
            const deleteQuery = `
                DELETE FROM PatientFeatures 
                WHERE FeatureID = $1
                RETURNING *;
            `;
            const deleteResult = await pool.query(deleteQuery, [featureID]);
            
            res.json({ 
                success: true,
                message: "Особенность пациента успешно удалена",
                data: deleteResult.rows[0]
            });
            
        } catch (error) {
            console.error("Ошибка при удалении особенности пациента:", error);
            res.status(500).json({ 
                error: "Не удалось удалить особенность пациента" 
            });
        }
    },

    async toggleStatus(req, res) {
        try {
            const { featureID } = req.params;
            
            const query = `
                UPDATE PatientFeatures 
                SET IsActive = NOT IsActive
                WHERE FeatureID = $1
                RETURNING *;
            `;
            
            const result = await pool.query(query, [featureID]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ 
                    message: "Особенность пациента не найдена" 
                });
            }
            
            res.json(result.rows[0]);
            
        } catch (error) {
            console.error("Ошибка при изменении статуса особенности:", error);
            res.status(500).json({ 
                error: "Не удалось изменить статус особенности" 
            });
        }
    },

};

module.exports = patientFeaturesController;