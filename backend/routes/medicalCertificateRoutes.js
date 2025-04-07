const express = require('express')
const router = express.Router()
const medicalCertificateController = require('../controllers/medicalCertificateController')

router.post('/medicalCertificateCreate/', medicalCertificateController.create)
router.get('/medicalCertificateAll/', medicalCertificateController.getAll)
router.get('/medicalCertificateId/:certificateID', medicalCertificateController.getById)
router.put('/medicalCertificateUpdate/:certificateID', medicalCertificateController.update)
router.delete('/medicalCertificateDelete/:certificateID', medicalCertificateController.delete)

module.exports = router
