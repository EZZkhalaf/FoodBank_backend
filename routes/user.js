const express = require('express');

const {getAllUsers , CreateUser , loginUser, searchUser,
     followUser, saveRecipe, unsaveRecipe, deleteOwnRecipe,
     logout} = require('../Controllers/User');


const router = express.Router();



router.get('/' , getAllUsers);

router.post('/register' , CreateUser);
router.post('/login' , loginUser);
router.get('/logout' , logout);

router.post('/search' , searchUser);
router.post('/follow' , followUser);


router.post('/save' , saveRecipe);
router.post('/unsave' , unsaveRecipe);
router.post('/removeRecipe' , deleteOwnRecipe);


module.exports = router;