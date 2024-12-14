
const express = require('express');
const Recipe = require("../model/recipe");
const Ingredient = require('../model/ingredient');
const User = require('../model/User');
const ingredient = require('../model/ingredient');

const getRecipes = async(req,res)=>{
    const recipes = await Recipe.find();
    return res.json(recipes);

}

const getRecipe = async (req, res) => {
    try {
        // Find the recipe by ID
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        return res.status(200).json(recipe);
    } catch (error) {
        // Handle any errors that occur during the query
        return res.status(500).json({ message: 'Error retrieving recipe', error: error.message });
    }
};




// const addRecipe = async (req, res) => {
//     const { recipe_title, recipe_description, instructions, ingredients, recipe_user, recipe_image } = req.body;

//     // Check for required fields
//     if (!recipe_title || !instructions || !ingredients || !recipe_user) {
//         return res.status(400).json({ message: 'Required fields are empty ...' });
//     }

//     try {
//         // Validate that all ingredient names exist in the Ingredient collection
//         const validIngredients = await Ingredient.find({ ingredient_name: { $in: ingredients } });
//         const validIngredientNames = validIngredients.map(ingredient => ingredient.ingredient_name);

//         // Check if all provided ingredient names are valid
//         if (validIngredientNames.length !== ingredients.length) {
//             return res.status(400).json({ message: 'One or more ingredient names are invalid or do not exist.' });
//         }

//         // Create a new recipe
//         const newRecipe = await Recipe.create({
//             recipe_title,
//             recipe_description,
//             instructions,
//             ingredients, // Store the valid ingredient names
//             recipe_user,
//             recipe_image
//         });

//         // Respond with the created recipe
//         return res.status(201).json(newRecipe);
//     } catch (error) {
//         // Handle any errors that occur during creation
//         return res.status(500).json({ message: 'Error creating recipe', error: error.message });
//     }
// };

const addRecipe = async (req, res) => {
    const { recipe_title, recipe_description, instructions, ingredients, recipe_user, recipe_image } = req.body;

    // Check for required fields
    if (!recipe_title || !instructions || !ingredients || !recipe_user) {
        return res.status(400).json({ message: 'Required fields are empty ...' });
    }

    try {
        // Ensure ingredients are provided in the correct format
        if (!Array.isArray(ingredients) || ingredients.some(ing => !ing.name)) {
            return res.status(400).json({ message: 'Ingredients must be an array of objects with at least a "name" field.' });
        }

        // Extract ingredient names for validation
        const ingredientNames = ingredients.map(ing => ing.name);

        // Validate that all ingredient names exist in the Ingredient collection
        const validIngredients = await Ingredient.find({ ingredient_name: { $in: ingredientNames } });
        const validIngredientNames = validIngredients.map(ingredient => ingredient.ingredient_name);

        // Check if all provided ingredient names are valid
        if (validIngredientNames.length !== ingredientNames.length) {
            return res.status(400).json({ message: 'One or more ingredient names are invalid or do not exist.' });
        }

        // Create a new recipe
        const newRecipe = await Recipe.create({
            recipe_title,
            recipe_description,
            instructions,
            ingredients, // Save the full array of objects
            recipe_user,
            recipe_image
        });

        // Respond with the created recipe
        return res.status(201).json(newRecipe);
    } catch (error) {
        // Handle any errors that occur during creation
        return res.status(500).json({ message: 'Error creating recipe', error: error.message });
    }
};





const editRecipe = async (req, res) => {
    const { recipe_title, ingredients, instructions, recipe_description } = req.body;
    let recipe = await Recipe.findById(req.params.id);

    try {
        if (recipe) {
            // Update the recipe with the new values
            const updatedRecipe = await Recipe.findByIdAndUpdate(
                req.params.id,
                {
                    recipe_title,      // Using the correct field name
                    ingredients,
                    instructions,
                    recipe_description // Using the correct field name
                },
                { new: true }
            );
            res.json(updatedRecipe); // Respond with the updated recipe
        } else {
            return res.status(404).json({ message: 'Recipe not found' });
        }
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};



// const searchRecipesByIngredients = async(req,res) =>{
//     try{
//         const {ingredients} = req.body;
//     if (!ingredients || !Array.isArray(ingredients)){
//         return res.status(400).json({ error : 'please enter the desired ingredients'});
//     }

//     const foundIngredients = await Ingredient.find({
//         name : { $in : ingredients},
//     });

//     if(foundIngredients === 0){
//         return res.status(404).json({ error: 'No matching ingredients found.' });
//     }

//     const ingredientId = foundIngredients.map((i) => i._id);

//     //now find the recipes that contains the entered ingredients
//     const recipes = await  Recipe.find({
//         ingredients : {$all : ingredientId} //present all the founded ingredients 
//     });
//     if(recipes.length === 0){
//         return res.status(400).json({message : 'no recipes found with these ingredients'})
//     }
    
//     res.status(200).json(recipes);
// }catch(error){
//     console.log(error)
//     return res.status(500).json({error : "error in the server"})
// }

// }
const searchRecipesByIngredients = async (req, res) => {
    const { ingredients } = req.body;
  
    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ message: 'Please provide ingredients to search for.' });
    }
  
    try {
      // Build the query for ingredients
      const ingredientNames = ingredients.map(ingredient => ingredient.name);
  
      // Find recipes that contain all of the ingredients
      const recipes = await Recipe.find({
        'ingredients.name': { $all: ingredientNames }
      });
  
      if (recipes.length === 0) {
        return res.status(404).json({ message: 'No recipes found for the given ingredients.' });
      }
  
      return res.status(200).json(recipes);
    } catch (error) {
      return res.status(500).json({ message: 'Error searching recipes', error: error.message });
    }
  };


const deleteRecipe = (req,res)=>{
    res.json({message : 'this is delete recipe'})

}
module.exports = {getRecipes , getRecipe , addRecipe , editRecipe , deleteRecipe , searchRecipesByIngredients};