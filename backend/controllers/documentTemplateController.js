const { pool } = require('../config/db')

const documentTemplateController = {
    async create(req, res) {
        try {
          const { name } = req.body;
          const file = req.file;
    
          console.log('File:', file); // Логирование файла
    
          if (!file) {
            return res.status(400).json({ error: "File is required" });
          }
    
          const query = 
            'INSERT INTO DocumentTemplates (name, content, filename) VALUES ($1, $2, $3) RETURNING *';
          
          const values = [name, file.buffer, file.originalname]; // Используем file.buffer
          const result = await pool.query(query, values);
          res.status(201).json(result.rows[0]);
        } catch (error) {
          console.error('Error in create:', error);
          res.status(500).json({ error: error.message });
        }
      },

    async getById(req, res) {
        try {
            const { templateID } = req.params;
            const query = 'SELECT * FROM DocumentTemplates WHERE templateID = $1';
            const result = await pool.query(query, [templateID]);
            if (!result.rows.length) {
                return res.status(404).json({ message: "Template not found" });
            }
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAll(req, res) {
        try {
            const query = `SELECT * FROM DocumentTemplates;`
            const result = await pool.query(query)
            res.json(result.rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async update(req, res) {
        try {
          const { templateID } = req.params;
          const { name } = req.body;
          const file = req.file;
    
          console.log('File:', file); // Логирование файла
    
          let query;
          let values;
    
          if (file) {
            query = 
              'UPDATE DocumentTemplates SET name = $1, content = $2, filename = $3 WHERE templateid = $4 RETURNING *';
            values = [name, file.buffer, file.originalname, templateID]; // Используем file.buffer
          } else {
            query = 
              'UPDATE DocumentTemplates SET name = $1 WHERE templateid = $2 RETURNING *';
            values = [name, templateID];
          }
    
          const result = await pool.query(query, values);
          if (!result.rows.length) {
            return res.status(404).json({ message: "Template not found" });
          }
          res.json(result.rows[0]);
        } catch (error) {
          console.error('Error in update:', error);
          res.status(500).json({ error: error.message });
        }
      },

    async download(req, res) {
        try {
            const { templateID } = req.params;
            const query = 'SELECT * FROM DocumentTemplates WHERE templateid = $1';
            const result = await pool.query(query, [templateID]);
    
            if (!result.rows.length) {
                return res.status(404).json({ message: "Template not found" });
            }
    
            const template = result.rows[0];
    
            // Убедитесь, что content возвращается как бинарные данные
            if (!template.content) {
                return res.status(404).json({ message: "File content is empty" });
            }
    
            // Устанавливаем заголовки для скачивания файла
            res.setHeader('Content-Disposition', `attachment; filename=${template.filename}`);
            res.setHeader('Content-Type', 'application/octet-stream'); // Указываем тип содержимого
            res.send(template.content); // Отправляем бинарные данные
        } catch (error) {
            console.error('Error in download:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async delete(req, res) {
        try {
            const { templateID } = req.params
            const query = `DELETE FROM DocumentTemplates WHERE templateID = $1 RETURNING *;`
            const result = await pool.query(query, [templateID])
            if (!result.rows.length) {
                return res.status(404).json({ message: "Template not found" })
            }
            res.json({ message: "Deleted successfully", data: result.rows[0] })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = documentTemplateController
