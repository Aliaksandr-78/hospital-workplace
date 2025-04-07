const express = require('express')
const router = express.Router()
const patientController = require('../controllers/patientController')

router.post('/patientCreate/', patientController.create)
router.get('/patientAll/', patientController.getAll)
router.get('/patientId/:patientID', patientController.getById)
router.put('/patientUpdate/:patientID', patientController.update)
router.delete('/patientDelete/:patientID', patientController.delete)

module.exports = router
