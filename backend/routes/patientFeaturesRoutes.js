const express = require('express');
const router = express.Router();
const controller = require('../controllers/patientFeaturesController');

router.post('/patientFeaturesCreate/', controller.create);
router.get('/patientFeaturesId/:featureID', controller.getById);
router.get('/patientFeaturesByPatient/:patientID', controller.getByPatient);
router.put('/patientFeaturesUpdate/:featureID', controller.update);
router.delete('/patientFeaturesDelete/:featureID', controller.delete);
router.patch('/patientFeaturesToggleStatus/:featureID', controller.toggleStatus)

module.exports = router;