const express = require('express')
const router = express.Router()
const medicalRecordController = require('../controllers/medicalRecordController')

router.post('/medicalRecordCreate/', medicalRecordController.create)
router.get('/medicalRecordAll/', medicalRecordController.getAll)
router.get('/medicalRecordId/:recordID', medicalRecordController.getById)
router.delete('/medicalRecordDelete/:recordID', medicalRecordController.delete)

module.exports = router
