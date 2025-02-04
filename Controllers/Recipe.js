
const express = require('express');
const Recipe = require("../model/recipe");
const Ingredient = require('../model/ingredient');
const User = require('../model/User');
const ingredient = require('../model/ingredient');
const mongoose = require('mongoose');

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





const getUserRecipes = async (req, res) => {
    try {
        const userId = req.params.userid;
        console.log('Request Params:', req.params.userid);
      
      if (!userId) {
          return res.status(400).json({ message: "User ID is missing" });
        }
        console.log('testing')
  

      // Validate MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
  
      console.log('User ID validated:', userId);
  
      // Query the user and fetch their recipes
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    
      const recipes = await Recipe.find({ recipe_user: userId }); // Fetch recipes for the user
      return res.status(200).json(recipes);
  
    } catch (error) {
      console.error('Error fetching user recipes:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  


const addRecipe = async (req, res) => {
    const { recipe_title, recipe_description, instructions, ingredients, recipe_user, recipe_image, type } = req.body;

    // Check for required fields
    if (!recipe_title || !instructions || !ingredients || !recipe_user || !type) {
        return res.status(400).json({ message: 'Required fields are empty ...' });
    }

    try {
        // Check if the user exists
        const user = await User.findById(recipe_user);
        if (!user) {
            return res.status(400).json({ message: 'The user does not exist.' });
        }

        // Check if the recipe already exists in the user's collection
        const recipe_exist = await Recipe.findOne({
            recipe_title: { $eq: recipe_title },
            _id: { $in: user.ownRecipes }
        });
        if (recipe_exist) {
            return res.status(400).json({ message: 'A recipe with the same title already exists for this user.' });
        }

        // Ensure ingredients are in the correct format
        if (!Array.isArray(ingredients) || ingredients.some(ing => !ing.name || !ing.quantity)) {
            return res.status(400).json({ message: 'Ingredients must be an array of objects with at least "name" and "quantity" fields.' });
        }

        // Convert all ingredient names to lowercase and extract for validation
        const ingredientNames = ingredients.map(ing => ing.name.toLowerCase());

        // Check if all ingredients are valid
        const validIngredients = await Ingredient.find({ ingredient_name: { $in: ingredientNames } });
        const validIngredientNames = validIngredients.map(ingredient => ingredient.ingredient_name.toLowerCase());

        // Find invalid ingredients
        const invalidIngredients = ingredientNames.filter(name => !validIngredientNames.includes(name));

        if (invalidIngredients.length > 0) {
            return res.status(400).json({ message: `The following ingredient(s) are invalid or do not exist: ${invalidIngredients.join(', ')}` });
        }

        // Create the new recipe with ingredients (keeping them in lowercase)
        const normalizedIngredients = ingredients.map(ing => ({
            name: ing.name.toLowerCase(),
            quantity: ing.quantity
        }));

        const newRecipe = await Recipe.create({
            recipe_title,
            recipe_description,
            instructions,
            ingredients: normalizedIngredients,
            recipe_user,
            recipe_image,
            type
        });

        // Add the recipe to the user's collection
        user.ownRecipes.push(newRecipe._id);
        await user.save();

        return res.status(201).json('Recipe created successfully...');
    } catch (error) {
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
                    recipe_description 
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


const deleteAllRecipes = async(req,res) =>{
    try {
        const result = await Recipe.deleteMany({});
        res.json({ message: `${result.deletedCount} recipes deleted successfully` });
    } catch (error) {
        console.log(error)
    }
}

const deleteRecipe = async(req,res)=>{
    const {recipeid} = req.body ; 

    if(!recipeid){
        return res.status(500).json('fill the required field');
    }

    try{
        const deleteRecipe = await Recipe.findById(recipeid);

        if(!deleteRecipe){
            return res.status(404).json('recipe dont exist');

        }

        await Recipe.findByIdAndDelete(recipeid);
        return res.status(200).json('successfully deleted ...')


    }catch(err){
        return res.status(500).json({ message: 'Error deleting recipe', error: error.message });
    }
}
module.exports = {getRecipes , getRecipe , addRecipe 
    , editRecipe , deleteRecipe , searchRecipesByIngredients 
    , deleteRecipe , deleteAllRecipes , getUserRecipes};