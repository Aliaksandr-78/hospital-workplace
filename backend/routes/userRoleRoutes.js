const express = require('express')
const router = express.Router()
const userRoleController = require('../controllers/userRoleController')

router.post('/userRoleAssign/', userRoleController.assignRole)
router.get('/userRoleUserId/:userID', userRoleController.getByUserID)
router.get('/userRoleRoleId/:roleID', userRoleController.getByRoleID)
router.delete('/userRoleRemove/:userRoleID', userRoleController.removeRole)
router.put('/userRoleUpdate/', userRoleController.updateUserRoles)


module.exports = router
