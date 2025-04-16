const express = require('express')
const router = express.Router()
const diagnosisMedicationController = require('../controllers/diagnosisMedicationController')

router.post('/diagnosisMedicationCreate/', diagnosisMedicationController.create)
router.get('/diagnosisMedicationByDiagnosis/:diagnosisID', diagnosisMedicationController.getByDiagnosis)
router.put('/diagnosisMedicationUpdate/:diagnosisID/:medicationID', diagnosisMedicationController.update)
router.delete('/diagnosisMedicationDelete/:diagnosisID/:medicationID', diagnosisMedicationController.delete)

module.exports = router