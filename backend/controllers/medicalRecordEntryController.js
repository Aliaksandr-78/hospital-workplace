const { pool } = require('../config/db');

const medicalRecordEntryController = {
    /**
     * Создание новой записи в медицинской карте
     */
    async create(req, res) {
        try {          
          // Деструктуризация с альтернативными именами
          const { 
            recordid: recordID, 
            doctorid: doctorID, 
            entrytype: entryType, 
            content, 
            diagnosisid: diagnosisID 
          } = req.body;
      
          // Проверка наличия обязательных полей
          if (!entryType) {
            return res.status(400).json({ error: 'EntryType is required' });
          }
      
          const query = `
            INSERT INTO MedicalRecordEntries 
            (RecordID, DoctorID, EntryType, Content, DiagnosisID) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *;
          `;
          const values = [recordID, doctorID, entryType, content, diagnosisID];
                    
          const result = await pool.query(query, values);
          console.log('Создана запись с ID:', result.rows[0]?.entryid, ' в medicalRecordEntryController');
          res.status(201).json(result.rows[0]);
        } catch (error) {
          console.error('Полная ошибка:', error); // Подробное логирование
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
          const { content } = req.body;
      
          // Получаем текущую запись из БД
          const currentEntryQuery = `
            SELECT DiagnosisID FROM MedicalRecordEntries 
            WHERE EntryID = $1;
          `;
          const currentEntryResult = await pool.query(currentEntryQuery, [entryID]);
          
          if (!currentEntryResult.rows.length) {
            return res.status(404).json({ message: "Запись не найдена" });
          }
      
          const currentDiagnosisID = currentEntryResult.rows[0].diagnosisid;
      
          const query = `
            UPDATE MedicalRecordEntries 
            SET Content = $1
            WHERE EntryID = $2 
            RETURNING *;
          `;
          const values = [content, entryID];
          
          const result = await pool.query(query, values);
          
          res.json(result.rows[0]);
        } catch (error) {
          console.error('Ошибка при обновлении записи:', error);
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