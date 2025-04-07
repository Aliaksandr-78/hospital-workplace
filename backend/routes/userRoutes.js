const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.post('/userRegister/', userController.register)
router.post('/userLogin/', userController.login)
router.get("/validateToken/", userController.validateToken)
router.get('/userAll/', userController.getAll)
router.get('/userId/:userID', userController.getById)
router.put('/userUpdate/:userID', userController.update)
router.delete('/userDelete/:userID', userController.delete)

module.exports = router
