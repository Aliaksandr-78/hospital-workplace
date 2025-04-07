const express = require('express')
const router = express.Router()
const specialtyController = require('../controllers/specialtyController')

router.post('/specialtyCreate/', specialtyController.create)
router.get('/specialtyAll/', specialtyController.getAll)
router.get('/specialtyId/:specialtyID', specialtyController.getById)
router.put('/specialtyUpdate/:specialtyID', specialtyController.update)
router.delete('/specialtyDelete/:specialtyID', specialtyController.delete)

module.exports = router
