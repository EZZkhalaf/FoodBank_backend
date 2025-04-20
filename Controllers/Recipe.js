
const express = require('express');
const Recipe = require("../model/recipe");
const Ingredient = require('../model/ingredient');
const User = require('../model/User');
const ingredient = require('../model/ingredient');
const mongoose = require('mongoose');
const recipe = require('../model/recipe');

const getRecipes = async(req,res)=>{
    const recipes = await Recipe.find();
    return res.status(200).json(recipes);

}

const getRecipe = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId before querying
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid recipe ID format' });
        }

        // Find the recipe by ID
        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        return res.status(200).json(recipe);
    } catch (error) {
        console.error('Error retrieving recipe:', error);
        return res.status(500).json({ message: 'Error retrieving recipe', error: error.message });
    }
};


const getUserRecipes = async (req, res) => {
    const userId = req.params.userid;
    try {
        // console.log('Request Params:', req.params.userid);
      
      if (!userId) {
          return res.status(400).json({ message: "User ID is missing" });
        }
        // console.log('testing')
  

      // Validate MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
  
    //   console.log('User ID validated:', userId);
  
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


// const addRecipe = async (req, res) => {
//     const { recipe_title, recipe_description, instructions, ingredients, recipe_user, recipe_image, type, difficulty, cookingTime } = req.body;

//     // Check for required fields
//     if (!recipe_title || !instructions || !ingredients || !recipe_user || !type) {
//         return res.status(400).json({ message: 'Required fields are empty.' });
//     }

//     try {
//         // Check if the user exists
//         const user = await User.findById(recipe_user);
//         if (!user) {
//             return res.status(400).json({ message: 'The user does not exist.' });
//         }

//         // Check for duplicate recipe title for this user
//         const existingRecipe = await Recipe.findOne({ 
//             recipe_title: recipe_title, 
//             recipe_user: recipe_user 
//         });
//         if (existingRecipe) {
//             return res.status(400).json({ 
//                 message: 'A recipe with this title already exists for the user.' 
//             });
//         }

//         // Validate ingredients structure
//         if (
//             !Array.isArray(ingredients) || 
//             ingredients.length === 0 || // Ensure at least 1 ingredient
//             ingredients.some(ing => !ing.name?.trim() || !ing.quantity?.trim())
//         ) {
//             return res.status(400).json({ 
//                 message: 'Ingredients must be a non-empty array of objects with "name" and "quantity".' 
//             });
//         }

//         // Check if all ingredients exist in the database
//         const ingredientNames = ingredients.map(ing => ing.name.toLowerCase());
//         const validIngredients = await Ingredient.find({ 
//             ingredient_name: { $in: ingredientNames } 
//         });
        
//         const invalidIngredients = ingredientNames.filter(
//             name => !validIngredients.some(valid => valid.ingredient_name === name)
//         );
//         if (invalidIngredients.length > 0) {
//             return res.status(400).json({ 
//                 message: `Invalid ingredient(s): ${invalidIngredients.join(', ')}` 
//             });
//         }

//         // Create the new recipe (with transaction support)
//         //to alllow multiple operations in the db to be executed 
//         const session = await mongoose.startSession();
//         session.startTransaction();

//         try {
//             const newRecipe = await Recipe.create([{
//                 recipe_title,
//                 recipe_description,
//                 instructions,
//                 ingredients: ingredients.map(ing => ({
//                     name: ing.name.toLowerCase(),
//                     quantity: ing.quantity
//                 })),
//                 recipe_user,
//                 recipe_image,
//                 type,
//                 difficulty, // Added difficulty field
//                 cookingTime // Added cookingTime field
//             }], { session });

//             user.ownRecipes.push(newRecipe[0]._id);
//             await user.save({ session });

//             await session.commitTransaction();
//             res.status(201).json({ message: 'Recipe created successfully.' });
//         } catch (error) {
//             await session.abortTransaction();
//             throw error; // Trigger outer catch block
//         } finally {
//             session.endSession();
//         }

//     } catch (error) {
//         return res.status(500).json({ 
//             message: 'Error creating recipe', 
//             error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
//         });
//     }
// };





const addRecipe = async (req, res) => {
    const recipes = req.body;

    if (!Array.isArray(recipes)) {
        return res.status(400).json({ message: 'Request body must be an array of recipes.' });
    }

    for (const recipe of recipes) {
        if (!recipe.recipe_title || !recipe.instructions || !recipe.ingredients || !recipe.recipe_user || !recipe.type) {
            return res.status(400).json({ message: 'One or more recipes are missing required fields.' });
        }
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const newRecipes = await Recipe.create(recipes.map(recipe => ({
                recipe_title: recipe.recipe_title,
                recipe_description: recipe.recipe_description,
                instructions: recipe.instructions,
                ingredients: recipe.ingredients.map(ing => ({
                    name: ing.name.toLowerCase(),
                    quantity: ing.quantity
                })),
                recipe_user: recipe.recipe_user,
                recipe_image: recipe.recipe_image,
                type: recipe.type,
                difficulty: recipe.difficulty,
                cookingTime: recipe.cookingTime
            })), { session });

            // 更新用户拥有的食谱
            const user = await User.findById(recipes[0].recipe_user).session(session);
            if (!user) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'The user does not exist.' });
            }

            user.ownRecipes.push(...newRecipes.map(r => r._id));
            await user.save({ session });

            // 提交事务
            await session.commitTransaction();
            res.status(201).json({ message: 'Recipes created successfully.', recipeId: newRecipes.map(r => r._id) });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    } catch (error) {
        return res.status(500).json({ 
            message: 'Error creating recipes', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
        });
    }
};


const editRecipe = async (req, res) => {
    // const { newRecipe_title, newIngredients, newInstructions, 
    //     newRecipe_description  , newCookingTime , newRecipe_image  } = req.body;
    // const {RecipeId} = req.params;
    
    // try {
        // let recipe = await Recipe.findById(RecipeId);
        // if (recipe) {

        //     const recipefound = await Recipe.findById(RecipeId);
        //     if(!recipefound) return res.status(404).json({message : "recipe not found"});
        //     const updatedField = {};
        //     if(newRecipe_title) updatedField.recipe_title = newRecipe_title;
        //     if(newIngredients) updatedField.ingredients = newIngredients;
        //     if(newInstructions) updatedField.instructions = newInstructions;
        //     if(newRecipe_description) updatedField.recipe_description = newRecipe_description;
        //     if(newCookingTime) updatedField.cookingTime = newCookingTime;
        //     if(newRecipe_image) updatedField.recipe_image = newRecipe_image;
            
            
            
        //     // Handle image upload
        //     if (req.file) {
        //         // Convert image to Base64 if needed
        //         const imageBuffer = req.file.buffer;
        //         const imageBase64 = imageBuffer.toString('base64');
        //         const imageMimeType = req.file.mimetype;
        //         updatedField.recipe_image = `data:${imageMimeType};base64,${imageBase64}`;
        //     } else if (req.body.newRecipe_image) {
        //         updatedField.recipe_image = req.body.newRecipe_image;
        //     }
    
        //     // Update the recipe
        //     if (Object.keys(updatedField).length === 0) {
        //         return res.status(200).json({ message: 'No changes in the recipe info.', recipe });
        //     }
    
        //     const updatedRecipe = await Recipe.findByIdAndUpdate(
        //         RecipeId,
        //         { $set: updatedField },
        //         { new: true }
        //     );
    
        //     res.status(200).json(updatedRecipe);

        // } else {
        //     return res.status(404).json({ message: 'Recipe not found' });
        // }

        const { RecipeId } = req.params;
    
        try {
            // Find the recipe
            let recipe = await Recipe.findById(RecipeId);
            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }
    
            // Prepare updated fields
            const updatedField = {};
            if (req.body.newRecipe_title) updatedField.recipe_title = req.body.newRecipe_title;
            
            // Parse ingredients from JSON string
            if (req.body.newIngredients) {
                try {
                    const parsedIngredients = JSON.parse(req.body.newIngredients);
                    if (Array.isArray(parsedIngredients)) {
                        updatedField.ingredients = parsedIngredients;
                    } else {
                        return res.status(400).json({ message: 'Invalid ingredients format' });
                    }
                } catch (error) {
                    return res.status(400).json({ message: 'Invalid ingredients JSON' });
                }
            }
    
            if (req.body.newInstructions) updatedField.instructions = req.body.newInstructions;
            if (req.body.newRecipe_description) updatedField.recipe_description = req.body.newRecipe_description;
            if (req.body.newCookingTime) updatedField.cookingTime = req.body.newCookingTime;
            
            // Handle image upload
            if (req.file) {
                // Convert image to Base64 if needed
                const imageBuffer = req.file.buffer;
                const imageBase64 = imageBuffer.toString('base64');
                const imageMimeType = req.file.mimetype;
                updatedField.recipe_image = `data:${imageMimeType};base64,${imageBase64}`;
            } else if (req.body.newRecipe_image) {
                updatedField.recipe_image = req.body.newRecipe_image;
            }
    
            // Update the recipe
            if (Object.keys(updatedField).length === 0) {
                return res.status(200).json({ message: 'No changes in the recipe info.', recipe });
            }
    
            const updatedRecipe = await Recipe.findByIdAndUpdate(
                RecipeId,
                { $set: updatedField },
                { new: true }
            );
    
            res.status(200).json(updatedRecipe);
        } catch (error) {
            console.error("Error updating recipe:", error);
            return res.status(400).json({ message: error.message });
        }

};

const getMultipleRecipesData = async (req,res) => {
    const {recipeIds} = req.body;

    if(!recipeIds || !Array.isArray(recipeIds)) return res.status(400).json({message : 'invalid recipe id type .'})
    try {

        // Validate and filter only valid ObjectIds
        const validIds = recipeIds.filter(id => /^[0-9a-fA-F]{24}$/.test(id));
        
        if (validIds.length === 0) {
            return res.status(400).json({ message: 'No valid recipe IDs provided.' });
        }

        //turn the ids string into mongo object
        const RecipesIdsObject  = validIds.map(rid => new mongoose.Types.ObjectId(rid));

        const recipes = await Recipe.find({ _id : {$in : RecipesIdsObject}}) ;

        return res.status(200).json(recipes);
     } catch (error) {
        console.error('Error fetching saved recipes:', error);
        res.status(500).json({ message: 'Server error' });
     }

}


const searchRecipesByIngredients = async (req, res) => {
    const { ingredients } = req.body;
  
    // Ensure the ingredients array is valid
    if (!Array.isArray(ingredients) || ingredients.length === 0)  return res.status(400).json({ message: 'Please provide a valid list of ingredients to search for.' });
    
  
    try {
      // Extract the ingredient names from the request body
      const ingredientNames = ingredients.map(ingredient => ingredient.ingredient_name).filter(Boolean);
  
      // Ensure the ingredient names are valid (non-empty)
      if (ingredientNames.length === 0)  return res.status(400).json({ message: 'Ingredient names cannot be empty.' });
      
  
      // Find recipes that match any of the ingredients
      const recipes = await Recipe.find({ 
        'ingredients.name': { $in: ingredientNames }
    }).lean(); // Optimize query by using .lean()
  
      if (recipes.length === 0) return res.status(404).json({ message: 'No recipes found for the given ingredients.' });
      
  
      return res.status(200).json(recipes);
    } catch (error) {
      console.error('Error searching recipes:', error);
      return res.status(500).json({ message: 'Error searching recipes', error: error.message });
    }
};
  
const searchRecipeByName = async(req,res)=>{
    const {recipe_name} = req.body;
    if(!recipe_name){
        return res.status(500).json('please provide us with the recipe name .');
    }
    try {
        const existingRecipe = await Recipe.find({
            recipe_title: {
                $regex : recipe_name , 
                $options : 'i'
            }//regex for case insensitive
        });
        if(existingRecipe.length === 0) return res.status(404).json({ message: 'No matching recipes found.' });
        
        return res.status(200).json(existingRecipe);

    } catch (error) {
        return res.status(500).json({ message: 'Error searching recipe', error: error.message });
        
    }
}

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
    , deleteRecipe , deleteAllRecipes , getUserRecipes
    ,searchRecipeByName , getMultipleRecipesData};