const express = require('express')
const router = express.Router()
const appointmentServiceController = require('../controllers/appointmentServiceController')

router.post('/appointmentServiceCreate/', appointmentServiceController.addServiceToAppointment)
router.get('/appointmentServiceId/:appointmentID', appointmentServiceController.getServicesByAppointment)
router.delete('/appointmentServiceDelete/:appointmentServiceID', appointmentServiceController.removeServiceFromAppointment)

module.exports = router
