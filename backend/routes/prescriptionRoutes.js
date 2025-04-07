const express = require('express')
const router = express.Router()
const prescriptionController = require('../controllers/prescriptionController')

router.post('/prescriptionCreate/', prescriptionController.create)
router.get('/prescriptionAll/', prescriptionController.getAll)
router.get('/prescriptionId/:prescriptionID', prescriptionController.getById)
router.put('/prescriptionUpdate/:prescriptionID', prescriptionController.update)
router.delete('/prescriptionDelete/:prescriptionID', prescriptionController.delete)

module.exports = router
