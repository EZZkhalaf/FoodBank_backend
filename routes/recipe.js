const express = require('express');
const { getRecipes , getRecipe, editRecipe, addRecipe, deleteRecipe
     , searchRecipesByIngredients ,deleteAllRecipes , getUserRecipes} = require('../Controllers/Recipe');
const router = express.Router();





router.get('/' ,getRecipes)//all recipe

router.post('/' ,addRecipe)

router.get('/:id' ,getRecipe) //search recipe by name

router.get('/getUserRecipes/:userid' ,getUserRecipes) //search recipe by name


router.put('/:id' ,editRecipe)//edit the recipe

router.delete('/' ,deleteRecipe)//delete the recipe

router.delete('/all' ,deleteAllRecipes)//delete all recipes

router.post('/search' , searchRecipesByIngredients);//search using ingredients

module.exports=router;


// ├── /recipes
// │   ├── GET /            - Get all recipes (with optional filters)
// │   └── POST /           - Add a new recipe (admin or user-uploaded)
// │   ├── POST /search     - Search recipes based on user ingredients
// │   ├── GET /:id         - Get recipe details by recipe ID
// │   └── POST /recipes/:id/reviews - Add a review or rating for a recipe(not added yet)
// │   └──GET /recipes/:id/reviews - Get all reviews for a recipe(not added yet)
// │