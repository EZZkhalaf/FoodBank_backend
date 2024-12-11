
const express = require('express');
const Recipe = require("../model/recipe");
const Ingredient = require('../model/ingredient');
const User = require('../model/User')

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
//         // Validate ingredient name and chack if they exist in the database 
//         const validIngredients = await Ingredient.find({ '_id': { $in: ingredients } });
//         if (validIngredients.length !== ingredients.length) {
//             return res.status(400).json({ message: 'One or more ingredient IDs are invalid.' });
//         }

//         // Validate user ID
//         const validUser = await User.findById(recipe_user);
//         if (!validUser) {
//             return res.status(400).json({ message: 'User ID is invalid.' });
//         }

//         // Create a new recipe
//         const newRecipe = await Recipe.create({
//             recipe_title,
//             recipe_description,
//             instructions,
//             ingredients,
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
        // Validate that all ingredient names exist in the Ingredient collection
        const validIngredients = await Ingredient.find({ ingredient_name: { $in: ingredients } });
        const validIngredientNames = validIngredients.map(ingredient => ingredient.ingredient_name);

        // Check if all provided ingredient names are valid
        if (validIngredientNames.length !== ingredients.length) {
            return res.status(400).json({ message: 'One or more ingredient names are invalid or do not exist.' });
        }

        // Create a new recipe
        const newRecipe = await Recipe.create({
            recipe_title,
            recipe_description,
            instructions,
            ingredients, // Store the valid ingredient names
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




const deleteRecipe = (req,res)=>{
    res.json({message : 'this is delete recipe'})

}
module.exports = {getRecipes , getRecipe , addRecipe , editRecipe , deleteRecipe};