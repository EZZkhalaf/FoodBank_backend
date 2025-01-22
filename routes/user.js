const express = require('express');
const {getAllUsers , CreateUser , loginUser, searchUser, followUser} = require('../Controllers/User');
const router = express.Router();



router.get('/' , getAllUsers);
router.post('/register' , CreateUser);
router.post('/login' , loginUser);
router.post('/search' , searchUser);
router.post('/follow' , followUser);

module.exports = router;