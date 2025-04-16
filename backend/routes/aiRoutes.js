const express = require('express');
const router = express.Router();
const medicalAI = require('../services/MedicalAI');

// Инициализация при старте сервера
medicalAI.initialize().catch(err => {
  console.error('Ошибка инициализации MedicalAI:', err);
});

// Получение рекомендаций
router.get('/recommend/:diagnosisId', async (req, res) => {
  try {
    const { diagnosisId } = req.params;
    const { patientId } = req.query;
    
    const result = await medicalAI.getRecommendations(diagnosisId, patientId);
    res.json(result);
  } catch (err) {
    console.error('Ошибка рекомендаций:', err);
    res.status(500).json({ 
      error: 'Ошибка получения рекомендаций',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Логирование обратной связи
router.post('/feedback', async (req, res) => {
  try {
    const { prescriptionId, effectiveness, sideEffects, comments } = req.body;
    
    await pool.query(`
      INSERT INTO PrescriptionFeedback (
        PrescriptionID, Effectiveness, SideEffects, DoctorComments
      ) VALUES ($1, $2, $3, $4)
    `, [prescriptionId, effectiveness, sideEffects, comments]);
    
    res.json({ status: 'success' });
  } catch (err) {
    console.error('Ошибка сохранения обратной связи:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;