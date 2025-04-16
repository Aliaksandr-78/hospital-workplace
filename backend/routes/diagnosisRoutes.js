const express = require('express')
const router = express.Router()
const diagnosisController = require('../controllers/diagnosisController')

router.post('/diagnosisCreate/', diagnosisController.create)
router.get('/diagnosisId/:diagnosisID', diagnosisController.getById)
router.get('/diagnosisAll/', diagnosisController.getAll)
router.put('/diagnosisUpdete/:diagnosisID', diagnosisController.update)
router.delete('/diagnosisDelete/:diagnosisID', diagnosisController.delete)

module.exports = router