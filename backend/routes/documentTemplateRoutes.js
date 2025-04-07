// routes/documentTemplateRoutes.js
const express = require('express');
const router = express.Router();
const documentTemplateController = require('../controllers/documentTemplateController');
const upload = require('../config/multer'); // Исправленный импорт

router.post('/documentTemplateCreate/', upload.single('file'), documentTemplateController.create);
router.get('/documentTemplateAll/', documentTemplateController.getAll);
router.get('/documentTemplateId/:templateID', documentTemplateController.getById);
router.put('/documentTemplateUpdate/:templateID', upload.single('file'), documentTemplateController.update);
router.delete('/documentTemplateDelete/:templateID', documentTemplateController.delete);
router.get('/documentTemplateDownload/:templateID', documentTemplateController.download);

module.exports = router;