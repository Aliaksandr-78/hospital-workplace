const express = require('express')
const router = express.Router()
const labTestResultController = require('../controllers/labTestResultController')

router.post('/labTestResultCreate/', labTestResultController.create)
router.get('/labTestResultAll', labTestResultController.getAll)
router.get('/labTestResultId/:resultID', labTestResultController.getById)
router.get('/labTestResultPatient/:patientID', labTestResultController.getByPatientAll)
router.put('/labTestResultUpdate/:resultID', labTestResultController.update)
router.delete('/labTestResultDelete/:resultID', labTestResultController.delete)

module.exports = router