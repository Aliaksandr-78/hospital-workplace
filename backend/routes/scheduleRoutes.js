const express = require('express')
const router = express.Router()
const scheduleController = require('../controllers/scheduleController')

router.post('/scheduleCreate/', scheduleController.create)
router.get('/scheduleAll/', scheduleController.getAll)
router.get('/scheduleId/:scheduleID', scheduleController.getById)
router.put('/scheduleUpdate/:scheduleID', scheduleController.update)
router.delete('/scheduleDelete/:scheduleID', scheduleController.delete)

module.exports = router
