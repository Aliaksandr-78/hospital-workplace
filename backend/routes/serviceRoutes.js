const express = require('express')
const router = express.Router()
const serviceController = require('../controllers/serviceController')

router.post('/serviceCreate/', serviceController.create)
router.get('/serviceAll/', serviceController.getAll)
router.get('/serviceId/:serviceID', serviceController.getById)
router.put('/serviceUpdate/:serviceID', serviceController.update)
router.delete('/serviceDelete/:serviceID', serviceController.delete)

module.exports = router
