const express = require('express');
const router = express.Router();
const controller = require('../controllers/recordEntryPrescriptionsController');

// Создание связи
router.post('/recordEntryPrescriptionsCreate/', controller.create);

// Удаление связи
router.delete('/recordEntryPrescriptionsDelete/:EntryID/:PrescriptionID', controller.delete);

// Поиск назначений по записи
router.get('/recordEntryPrescriptionsByEntry/:EntryID', controller.findByEntry);

module.exports = router;