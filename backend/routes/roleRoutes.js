const express = require('express')
const router = express.Router()
const roleController = require('../controllers/roleController')

router.post('/roleCreate/', roleController.create)
router.get('/roleAll/', roleController.getAll)
router.get('/roleId/:roleID', roleController.getById)
router.put('/roleUpdate/:roleID', roleController.update)
router.delete('/roleDelete/:roleID', roleController.delete)

module.exports = router
