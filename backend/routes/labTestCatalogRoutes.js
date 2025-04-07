const express = require('express')
const router = express.Router()
const labTestCatalogController = require('../controllers/labTestCatalogController')

router.post('/labTestCatalogCreate/', labTestCatalogController.create)
router.get('/labTestCatalogAll/', labTestCatalogController.getAll)
router.get('/labTestCatalogId/:testID', labTestCatalogController.getById)
router.put('/labTestCatalogUpdate/:testID', labTestCatalogController.update)
router.delete('/labTestCatalogDelete/:testID', labTestCatalogController.delete)

module.exports = router
