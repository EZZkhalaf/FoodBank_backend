const express = require('express');
const {getAllUsers , CreateUser , loginUser} = require('../Controllers/User');
const router = express.Router();



router.get('/' , getAllUsers);
router.post('/register' , CreateUser);
router.post('/login' , loginUser);


module.exports = router;