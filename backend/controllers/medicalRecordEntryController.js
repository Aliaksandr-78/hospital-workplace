const { pool } = require('../config/db');

const medicalRecordEntryController = {
    /**
     * Создание новой записи в медицинской карте
     */
    async create(req, res) {
        try {
            const { recordID, doctorID, entryType, content, diagnosisID } = req.body;
            const query = `
                INSERT INTO MedicalRecordEntries 
                (RecordID, DoctorID, EntryType, Content, DiagnosisID) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *;
            `;
            const values = [recordID, doctorID, entryType, content, diagnosisID];
            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Получение записи по ID
     */
    async getById(req, res) {
        try {
            const { entryID } = req.params;
            const query = `
                SELECT m.*, d.Name as DiagnosisName
                FROM MedicalRecordEntries m
                LEFT JOIN Diagnoses d ON m.DiagnosisID = d.DiagnosisID
                WHERE EntryID = $1;
            `;
            const result = await pool.query(query, [entryID]);
            
            if (!result.rows.length) {
                return res.status(404).json({ message: "Запись не найдена" });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Получение всех записей для конкретной медицинской карты
     */
    async getByRecordAll(req, res) {
        try {
            const { recordID } = req.params;
            const query = `
                SELECT m.*, d.Name as DiagnosisName, u.FirstName, u.LastName
                FROM MedicalRecordEntries m
                LEFT JOIN Diagnoses d ON m.DiagnosisID = d.DiagnosisID
                LEFT JOIN Users u ON m.DoctorID = u.UserID
                WHERE m.RecordID = $1
                ORDER BY m.EntryDate DESC;
            `;
            const result = await pool.query(query, [recordID]);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Обновление записи
     */
    async update(req, res) {
        try {
            const { entryID } = req.params;
            const { content, diagnosisID } = req.body;
            
            const query = `
                UPDATE MedicalRecordEntries 
                SET Content = $1, DiagnosisID = $2
                WHERE EntryID = $3 
                RETURNING *;
            `;
            const values = [content, diagnosisID, entryID];
            const result = await pool.query(query, values);
            
            if (!result.rows.length) {
                return res.status(404).json({ message: "Запись не найдена" });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Удаление записи
     */
    async delete(req, res) {
        try {
            const { entryID } = req.params;
            const query = `
                DELETE FROM MedicalRecordEntries 
                WHERE EntryID = $1 
                RETURNING *;
            `;
            const result = await pool.query(query, [entryID]);
            
            if (!result.rows.length) {
                return res.status(404).json({ message: "Запись не найдена" });
            }
            
            res.json({ message: "Запись успешно удалена", data: result.rows[0] });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = medicalRecordEntryController;