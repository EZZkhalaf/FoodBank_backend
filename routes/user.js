

const express = require('express');
const User = require('../model/User')
const { 
  getAllUsers, 
  CreateUser, 
  loginUser, 
  searchUser,
  toggleFollowUser, 
  saveRecipe, 
  unsaveRecipe, 
  deleteOwnRecipe,
  logout, 
  getUserById,
  checkSaved,
  getSavedRecipes,
  checkFollowStatus, 
  editProfile,
  updateProfilePicture,
  getUserFeed
} = require('../Controllers/User');

const multer = require('multer');
const { protect } = require('../middleware/protect');




// const upload = require('../multerConfig');
const upload = multer();

const router = express.Router();

// Get all users
router.get('/', getAllUsers);

// User registration
router.post('/register', CreateUser);

// User login
router.post('/login', loginUser);

// User logout
router.get('/logout', logout);

// Search user
router.post('/search/', searchUser);

// Get user by ID
router.post('/getUserById', getUserById);

// http://localhost:3000/user/toggleFollow
router.post('/toggleFollow', toggleFollowUser);

// http://localhost:3000/user/checkFollowStatus
router.post('/checkFollowStatus', checkFollowStatus);

// http://localhost:3000/user/updateTheUserProfile
router.post('/updateTheUserProfile',upload.single('image') ,editProfile);



// http://localhost:3000/user/checkSave
router.post('/checkSave', checkSaved);

// Save a recipe
router.post('/save', saveRecipe);

// Unsave a recipe
router.post('/unsave', unsaveRecipe);

// Get saved recipes for a user
router.get('/savedRecipes/:userid', getSavedRecipes);

// Delete a user's own recipe
router.post('/removeRecipe', deleteOwnRecipe);

//display the other users recipes in the user home page 
// router.get('/getUserFeed' ,  getUserFeed);


//this is the same as above but with a middleware to ensure the security using the token , will add later 
router.get('/getUserFeed' , protect, getUserFeed);

module.exports = router;
