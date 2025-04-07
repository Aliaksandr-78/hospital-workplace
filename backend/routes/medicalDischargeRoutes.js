const express = require('express')
const router = express.Router()
const medicalDischargeController = require('../controllers/medicalDischargeController')

router.post('/medicalDischargeCreate/', medicalDischargeController.create)
router.get('/medicalDischargeAll/', medicalDischargeController.getAll)
router.get('/medicalDischargeId/:dischargeID', medicalDischargeController.getById)
router.put('/medicalDischargeUpdate/:dischargeID', medicalDischargeController.update)
router.delete('/medicalDischargeDelete/:dischargeID', medicalDischargeController.delete)

module.exports = router
