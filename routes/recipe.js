const express = require('express');
const { getRecipes , getRecipe, editRecipe, addRecipe, deleteRecipe } = require('../Controllers/Recipe');
const router = express.Router();




router.post('/' ,addRecipe)

router.get('/' ,getRecipes)//all recipe

router.get('/:id' ,getRecipe) //search recipe

router.put('/:id' ,editRecipe)//edit the recipe

router.delete('/' ,deleteRecipe)//delete the recipe

module.exports=router;