const express = require('express');
const { getRecipes , getRecipe, editRecipe, addRecipe, deleteRecipe
     , searchRecipesByIngredients ,deleteAllRecipes , getUserRecipes ,searchRecipeByName,
     getMultipleRecipesData,
     getRecipesPerPage,
     getPopularRecipe} = require('../Controllers/Recipe');
const router = express.Router();

const multer = require('multer')
// const upload = require('../multerConfig');
const upload = multer();



router.get('/' ,getRecipes)//all recipe

router.post('/' ,addRecipe)

router.get('/getRecipesPerPage' , getRecipesPerPage);

router.get('/:id' ,getRecipe) //search recipe by name(a single recipe )

router.get('/mostPopularRecipe/first', getPopularRecipe);

router.post('/searchRecipeByName' , searchRecipeByName);//for the search box for the other users recipes

router.post('/search' , searchRecipesByIngredients);//search using ingredients

router.get('/getUserRecipes/:userid' ,getUserRecipes) //search recipe by name

router.post('/getMultipleRecipesData' , getMultipleRecipesData); //for the svaed recipe page update 

router.post('/:RecipeId' ,upload.single('image') , editRecipe)//edit the recipe

router.delete('/:recipeid' ,deleteRecipe)//delete the recipe

router.delete('/all' ,deleteAllRecipes)//delete all recipes


module.exports=router;


// ├── /recipes
// │   ├── GET /            - Get all recipes (with optional filters)
// │   └── POST /           - Add a new recipe (admin or user-uploaded)
// │   ├── POST /search     - Search recipes based on user ingredients
// │   ├── GET /:id         - Get recipe details by recipe ID
// │   └── POST /recipes/:id/reviews - Add a review or rating for a recipe(not added yet)
// │   └──GET /recipes/:id/reviews - Get all reviews for a recipe(not added yet)
// │