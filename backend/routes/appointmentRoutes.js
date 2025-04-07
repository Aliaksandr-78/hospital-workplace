const express = require('express')
const router = express.Router()
const appointmentController = require('../controllers/appointmentController')

router.post('/appointmentCreate/', appointmentController.create)
router.get('/appointmentAll/', appointmentController.getAll)
router.get('/appointmentId/:appointmentID', appointmentController.getById)
router.put('/appointmentUpdate/:appointmentID', appointmentController.update)
router.delete('/appointmentDelete/:appointmentID', appointmentController.delete)

module.exports = router
