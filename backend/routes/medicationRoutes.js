const express = require('express')
const router = express.Router()
const medicationController = require('../controllers/medicationController')

router.post('/medicationCreate/', medicationController.create)
router.get('/medicationAll/', medicationController.getAll)
router.get('/medicationId/:medicationID', medicationController.getById)
router.put('/medicationUpdate/:medicationID', medicationController.update)
router.delete('/medicationDelete/:medicationID', medicationController.delete)

module.exports = router
