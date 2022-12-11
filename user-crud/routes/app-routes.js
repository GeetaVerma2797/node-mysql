const express = require('express');
const router = express.Router({mergeParams:true});
const AuthGuard = require('../middleware/AuthGuardMiddleware')
const user = require('./../controllers/userController');
const {
    decryptBody,
    encryptHandler,
    decryptHandler,
} = require('../middleware/encryptionMiddleware')

// POST requests
router.post('/encrypt', encryptHandler);
router.post('/decrypt', decryptHandler);

router.post('/users/register', decryptBody, user.registerUser);
router.post('/users/login', decryptBody, user.loginUser)
router.get('/users/getUsers', AuthGuard,  user.getUsers)
router.post('/users/updateUser/:id', decryptBody, AuthGuard,  user.updateUser)
router.post('/users/deleteUser/:id', AuthGuard,  user.deleteUser)

module.exports = router;
