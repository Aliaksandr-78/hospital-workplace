const express = require('express');
const router = express.Router()
const consentFormController = require('../controllers/consentFormController')

router.post('/consentFormCreate/', consentFormController.create)
router.get('/consentFormAll/', consentFormController.getAll)
router.get('/consentFormId/:consentID', consentFormController.getById)
router.delete('/consentFormDelete/:consentID', consentFormController.delete)

module.exports = router
