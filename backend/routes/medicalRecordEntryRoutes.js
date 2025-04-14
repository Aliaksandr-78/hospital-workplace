const express = require('express')
const router = express.Router()
const medicalRecordEntryController = require('../controllers/medicalRecordEntryController')

router.post('/medicalRecordEntryCreate/', medicalRecordEntryController.create)
router.get('/medicalRecordEntryId/:entryID', medicalRecordEntryController.getById)
router.get('/medicalRecordEntryAll', medicalRecordEntryController.getByRecordAll)
router.put('/medicalRecordEntryUpdate/:entryID', medicalRecordEntryController.update)
router.delete('/medicalRecordEntryDelete/:entryID', medicalRecordEntryController.delete)

module.exports = router