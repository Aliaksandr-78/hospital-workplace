const express = require('express')
const router = express.Router()
const eventTypeController = require('../controllers/eventTypesController')

router.post('/eventTypesCreate/', eventTypeController.create);
router.get('/eventTypesId/:eventTypeID', eventTypeController.getById);
router.get('/eventTypesAll/', eventTypeController.getAll);
router.put('/eventTypesUpdate/:eventTypeID', eventTypeController.update);
router.delete('/eventTypesDelete/:eventTypeID', eventTypeController.delete);

module.exports = router;