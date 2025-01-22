
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
//     const { recipe_title, recipe_description, instructions, ingredients, recipe_user, recipe_image ,type} = req.body;

//     // Check for required fields
//     if (!recipe_title || !instructions || !ingredients || !recipe_user || !type) {
//         return res.status(400).json({ message: 'Required fields are empty ...' });
//     }

//     try {
//         // Ensure ingredients are provided in the correct format
//         if (!Array.isArray(ingredients) || ingredients.some(ing => !ing.name)) {
//             return res.status(400).json({ message: 'Ingredients must be an array of objects with at least a "name" field.' });
//         }

//         // Extract ingredient names for validation
//         const ingredientNames = ingredients.map(ing => ing.name);

//         // Validate that all ingredient names exist in the Ingredient collection
//         const validIngredients = await Ingredient.find({ ingredient_name: { $in: ingredientNames } });
//         const validIngredientNames = validIngredients.map(ingredient => ingredient.ingredient_name);

//         // Check if all provided ingredient names are valid
//         if (validIngredientNames.length !== ingredientNames.length) {
//             return res.status(400).json({ message: 'One or more ingredient names are invalid or do not exist.' });
//         }

//         // Create a new recipe
//         const newRecipe = await Recipe.create({
//             recipe_title,
//             recipe_description,
//             instructions,
//             ingredients, // Save the full array of objects
//             recipe_user,
//             recipe_image,
//             type
//         });

//         // Respond with the created recipe
//         return res.status(201).json(newRecipe);
//     } catch (error) {
//         // Handle any errors that occur during creation
//         return res.status(500).json({ message: 'Error creating recipe', error: error.message });
//     }
// };



const addRecipe = async (req, res) => {
    const { recipe_title, recipe_description, instructions, ingredients, recipe_user, recipe_image, type } = req.body;

    // Check for required fields
    if (!recipe_title || !instructions || !ingredients || !recipe_user || !type) {
        return res.status(400).json({ message: 'Required fields are empty ...' });
    }

    try {

        const user = await User.findById(recipe_user);

        if (!user) {
            return res.status(400).json({ message: 'The user does not exist.' });
        }


        // Ensure ingredients are provided in the correct format
        if (!Array.isArray(ingredients) || ingredients.some(ing => !ing.name || !ing.quantity)) {
            return res.status(400).json({ message: 'Ingredients must be an array of objects with at least "name" and "quantity" fields.' });
        }

        // Extract ingredient names for validation
        const ingredientNames = ingredients.map(ing => ing.name);

        // Validate that all ingredient names exist in the Ingredient collection
        // const validIngredients = await Ingredient.find({ ingredient_name: { $in: ingredientNames } });
        // const validIngredientNames = validIngredients.map(ingredient => ingredient.ingredient_name);

        // // Check if all provided ingredient names are valid
        // if (validIngredientNames.length !== ingredientNames.length) {
        //     return res.status(400).json({ message: 'One or more ingredient names are invalid or do not exist.' });
        // }

        // Validate that all ingredient names exist in the Ingredient collection
            const validIngredients = await Ingredient.find({ ingredient_name: { $in: ingredientNames } });
            const validIngredientNames = validIngredients.map(ingredient => ingredient.ingredient_name.toLowerCase());

            // Find invalid ingredient names
            const invalidIngredients = ingredientNames.filter(name => !validIngredientNames.includes(name.toLowerCase()));

            // If there are invalid ingredients, return an error with the missing ingredients
            if (invalidIngredients.length > 0) {
                return res.status(400).json({ message: `The following ingredient(s) are invalid or do not exist: ${invalidIngredients.join(', ')}` });
            }


        // Create a new recipe
        const newRecipe = await Recipe.create({
            recipe_title,
            recipe_description,
            instructions,
            ingredients, // Save the full array of objects
            recipe_user,
            recipe_image,
            type
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