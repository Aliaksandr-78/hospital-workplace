const express = require('express');
const router = express.Router();
const controller = require('../controllers/medicationContraindicationsController');

router.post('/medicationContraindicationsCreate/', controller.create);
router.get('/medicationContraindicationsId/:contraindicationID', controller.getById);
router.get('/medicationContraindicationsByMedication/:medicationID', controller.getByMedication);
router.put('/medicationContraindicationsUpdate/:contraindicationID', controller.update);
router.delete('/medicationContraindicationsDelete/:contraindicationID', controller.delete);

module.exports = router;