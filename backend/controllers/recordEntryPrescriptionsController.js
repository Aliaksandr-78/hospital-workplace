const { pool } = require('../config/db');

const recordEntryPrescriptionsController = {
    /**
     * Создает связь между записью в карте и назначением
     * @param {Object} req - Запрос
     * @param {Object} res - Ответ
     */
    async create(req, res) {
        try {
            console.log('Полученные данные:', req.body, ' В recordEntryPrescriptionsController')
            const { EntryID, PrescriptionID } = req.body;

            // Проверка существования записи и назначения
            const checkEntryQuery = 'SELECT 1 FROM MedicalRecordEntries WHERE EntryID = $1';
            const checkPrescriptionQuery = 'SELECT 1 FROM Prescriptions WHERE PrescriptionID = $1';
            
            const [entryResult, prescriptionResult] = await Promise.all([
                pool.query(checkEntryQuery, [EntryID]),
                pool.query(checkPrescriptionQuery, [PrescriptionID])
            ]);

            if (entryResult.rows.length === 0) {
                return res.status(404).json({ error: 'Запись в медицинской карте не найдена' });
            }

            if (prescriptionResult.rows.length === 0) {
                return res.status(404).json({ error: 'Назначение не найдено' });
            }

            // Проверка на существующую связь
            const checkExistingQuery = `
                SELECT 1 FROM RecordEntryPrescriptions 
                WHERE EntryID = $1 AND PrescriptionID = $2
            `;
            const existingResult = await pool.query(checkExistingQuery, [EntryID, PrescriptionID]);

            if (existingResult.rows.length > 0) {
                return res.status(400).json({ error: 'Связь между записью и назначением уже существует' });
            }

            // Создание связи
            const createQuery = `
                INSERT INTO RecordEntryPrescriptions (EntryID, PrescriptionID)
                VALUES ($1, $2)
                RETURNING *;
            `;
            const result = await pool.query(createQuery, [EntryID, PrescriptionID]);

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Ошибка при создании связи:', error);
            res.status(500).json({ error: 'Не удалось создать связь между записью и назначением' });
        }
    },

    /**
     * Удаляет связь между записью в карте и назначением
     * @param {Object} req - Запрос
     * @param {Object} res - Ответ
     */
    async delete(req, res) {
        try {
            const { EntryID, PrescriptionID } = req.params;

            const deleteQuery = `
                DELETE FROM RecordEntryPrescriptions 
                WHERE EntryID = $1 AND PrescriptionID = $2
                RETURNING *;
            `;
            const result = await pool.query(deleteQuery, [EntryID, PrescriptionID]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Связь не найдена' });
            }

            res.json({ message: 'Связь успешно удалена', data: result.rows[0] });
        } catch (error) {
            console.error('Ошибка при удалении связи:', error);
            res.status(500).json({ error: 'Не удалось удалить связь между записью и назначением' });
        }
    },

    /**
     * Получает все назначения для определенной записи в карте
     * @param {Object} req - Запрос
     * @param {Object} res - Ответ
     */
    async findByEntry(req, res) {
        try {
            const { EntryID } = req.params;

            const query = `
                SELECT 
                    p.PrescriptionID,
                    p.MedicationID,
                    m.Name AS MedicationName,
                    p.Dosage,
                    p.Frequency,
                    p.StartDate,
                    p.EndDate,
                    p.Instructions,
                    p.DoctorID,
                    d.FirstName || ' ' || d.LastName AS DoctorName
                FROM RecordEntryPrescriptions rep
                JOIN Prescriptions p ON rep.PrescriptionID = p.PrescriptionID
                JOIN Medications m ON p.MedicationID = m.MedicationID
                JOIN Users d ON p.DoctorID = d.UserID
                WHERE rep.EntryID = $1
                ORDER BY p.StartDate DESC;
            `;
            const result = await pool.query(query, [EntryID]);

            res.json(result.rows);
        } catch (error) {
            console.error('Ошибка при поиске назначений:', error);
            res.status(500).json({ error: 'Не удалось найти назначения для записи' });
        }
    }
};

module.exports = recordEntryPrescriptionsController;