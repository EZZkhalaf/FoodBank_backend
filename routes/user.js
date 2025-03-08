const express = require('express');

const {getAllUsers , CreateUser , loginUser, searchUser,
     followUser, saveRecipe, unsaveRecipe, deleteOwnRecipe,
     logout,
     getUserById,
     checkSaved,
     getSavedRecipes} = require('../Controllers/User');


const router = express.Router();



router.get('/' , getAllUsers);

router.post('/register' , CreateUser);
router.post('/login' , loginUser);
router.get('/logout' , logout);

router.get('/search' , searchUser);
router.post('/getUserById' , getUserById)
router.post('/follow' , followUser);

router.post('/checkSave' , checkSaved);
router.post('/save' , saveRecipe);
router.post('/unsave' , unsaveRecipe);
router.get('/savedRecipes/:userid',getSavedRecipes);

router.post('/removeRecipe' , deleteOwnRecipe);


module.exports = router;