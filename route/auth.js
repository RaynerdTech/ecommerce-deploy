const express = require('express');
const router = express.Router();
const { verify } = require('../middleware/verify');
const {register, login, logout} = require("../controller/auth")

router.post('/register', register);
router.post('/login', login);
router.post('/logout', verify, logout);

module.exports = router;
