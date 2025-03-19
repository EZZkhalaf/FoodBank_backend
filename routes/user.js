const express = require('express');

const {getAllUsers , CreateUser , loginUser, searchUser,
     toggleFollowUser, saveRecipe, unsaveRecipe, deleteOwnRecipe,
     logout, getUserById,checkSaved,getSavedRecipes,checkFollowStatus,
     editProfile} = require('../Controllers/User');


const router = express.Router();



router.get('/' , getAllUsers);

router.post('/register' , CreateUser);
router.post('/login' , loginUser);
router.get('/logout' , logout);
router.post('/updateTheUserProfile' , editProfile)

router.post('/search/' , searchUser);
router.post('/getUserById' , getUserById)
router.post('/toggleFollow' , toggleFollowUser);

router.post('/checkFollowStatus' , checkFollowStatus);



router.post('/checkSave' , checkSaved);
router.post('/save' , saveRecipe);
router.post('/unsave' , unsaveRecipe);
router.get('/savedRecipes/:userid',getSavedRecipes);

router.post('/removeRecipe' , deleteOwnRecipe);


module.exports = router;