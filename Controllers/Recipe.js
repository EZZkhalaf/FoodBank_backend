
const express = require('express');
const Recipe = require("../model/recipe");
const Ingredient = require('../model/ingredient');
const User = require('../model/User');
const ingredient = require('../model/ingredient');
const mongoose = require('mongoose');
const recipe = require('../model/recipe');


//will be modified later to send 12 recipes per page for faster frontend , this will handle the large numbers of recipes in the db 
const getRecipes = async(req,res)=>{
    const recipes = await Recipe.find();
    return res.status(200).json(recipes);

}


const getRecipesPerPage = async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 12;
    const searchQuery = req.query.searchQuery || '';
    const selectedIngredients = JSON.parse(req.query.ingredients || '[]');
    const selectedType = req.query.type || '';

    const filter = {};

    // Filter by recipe title or description
    if (searchQuery) {
      filter.$or = [
        { recipe_title: { $regex: searchQuery, $options: 'i' } },
        { recipe_description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Filter by recipe type
    if (selectedType) {
      filter.type = selectedType;
    }

    // Filter by ingredients (ingredient names, case insensitive)
    if (selectedIngredients.length > 0) {
      filter['ingredients.name'] = {
        $all: selectedIngredients.map(name => new RegExp(`^${name}$`, 'i'))
      };
    }

    const total = await Recipe.countDocuments(filter);
    const totalPages = Math.ceil(total / perPage);

    const recipes = await Recipe.find(filter)
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.json({ recipes, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


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

// const getPopulerRecipe = async(req,res)=>{
//   try {
//     const recipes = await Recipe.find();
//     if (!recipes || recipes.length === 0) {
//       return res.status(404).json({ message: 'No recipes found' });
//     }

//     const theRecipe = recipes.reduce((max,recipe) => 
//       (recipe.Bookmarks?.length || 0) > (max.Bookmarks?.length || 0) ? recipe : max  
//     )

//     return res.status(200).json(theRecipe);
//   } catch (error) {
//     return res.status(500).json({ 
//       message: 'Error finding recipes', 
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
//   });
//   }
// }




const getPopularRecipe = async (req, res) => {
  try {
    const recipes = await Recipe.find();

    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ message: 'No recipes found' });
    }

    const theRecipe = recipes.reduce((max, recipe) => {
      const currentCount = Array.isArray(recipe.Bookmarks) ? recipe.Bookmarks.length : 0;
      const maxCount = Array.isArray(max.Bookmarks) ? max.Bookmarks.length : 0;
      return currentCount > maxCount ? recipe : max;
    });

    return res.status(200).json(theRecipe);
  } catch (error) {
    console.error(error); // helpful in development
    return res.status(500).json({
      message: 'Error finding recipes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
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


const addRecipe = async (req, res) => {
    const recipes = req.body;

    if (!Array.isArray(recipes)) {
        return res.status(400).json({ message: 'Request body must be an array of recipes.' });
    }

    for (const recipe of recipes) {
        if (!recipe.recipe_title || !recipe.instructions || !recipe.ingredients || !recipe.recipe_user || !recipe.type) {
          console.log("testing") 
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

            
            const user = await User.findById(recipes[0].recipe_user).session(session);
            if (!user) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'The user does not exist.' });
            }

            user.ownRecipes.push(...newRecipes.map(r => r._id));
            await user.save({ session });

            
            await session.commitTransaction();
            res.status(201).json({ message: 'Recipes created successfully.' });

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

        const { RecipeId } = req.params;

        try {
          // Find the recipe
          let recipe = await Recipe.findById(RecipeId);
          if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
          }
      
          // Prepare updated fields
          const updatedFields = {};
          if (req.body.newRecipe_title) updatedFields.recipe_title = req.body.newRecipe_title;
      
          // Parse ingredients from JSON string
          if (req.body.newIngredients) {
            try {
              const parsedIngredients = JSON.parse(req.body.newIngredients);
              if (Array.isArray(parsedIngredients)) {
                // Transform ingredient_name to name and ensure quantity is present
                const transformedIngredients = parsedIngredients.map(ingredient => ({
                  name: ingredient.name || '', // Map ingredient_name to name
                  quantity: ingredient.quantity || '',   // Ensure quantity is present
                  unit: ingredient.unit || ''           // Include unit if available
                }));
                updatedFields.ingredients = transformedIngredients;
              } else {
                return res.status(400).json({ message: 'Invalid ingredients format' });
              }
            } catch (error) {
              return res.status(400).json({ message: 'Invalid ingredients JSON' });
            }
          }
      
          if (req.body.newInstructions) updatedFields.instructions = req.body.newInstructions;
          if (req.body.newRecipe_description) updatedFields.recipe_description = req.body.newRecipe_description;
          if (req.body.newCookingTime) {
            const cookingTime = parseInt(req.body.newCookingTime, 10);
            if (!isNaN(cookingTime)) {
              updatedFields.cookingTime = cookingTime;
            } else {
              return res.status(400).json({ message: 'Invalid cooking time' });
            }
          }
      
          // Handle image upload
          if (req.file) {
            // Convert image to Base64 if needed
            const imageBuffer = req.file.buffer;
            const imageBase64 = imageBuffer.toString('base64');
            const imageMimeType = req.file.mimetype;
            updatedFields.recipe_image = `data:${imageMimeType};base64,${imageBase64}`;
          } else if (req.body.newRecipe_image) {
            updatedFields.recipe_image = req.body.newRecipe_image;
          }
      
          // Update the recipe
          if (Object.keys(updatedFields).length === 0) {
            return res.status(200).json({ message: 'No changes in the recipe info.', recipe });
          }
      
          const updatedRecipe = await Recipe.findByIdAndUpdate(
            RecipeId,
            { $set: updatedFields },
            { new: true }
          );
      
          res.status(200).json(updatedRecipe);
        } catch (error) {
          console.error("Error updating recipe:", error);
          return res.status(400).json({ message: error.message });
        }
}


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
    try {
      const { ingredients } = req.body;
  
      // Validate the incoming ingredients
      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ message: 'Please provide a valid list of ingredients to search for.' });
      }
  
      // Extract ingredient names from the ingredients array
      const ingredientNames = ingredients
        .filter(ing => ing && ing.ingredient_name)
        .map(ing => ing.ingredient_name);
  
      if (ingredientNames.length === 0) {
        return res.status(400).json({ message: 'Ingredient names cannot be empty.' });
      }
  
      // Find recipes that match any of the ingredient names
      const recipes = await Recipe.find({
        'ingredients.name': { $in: ingredientNames },
      }).lean();
  
      if (recipes.length === 0) {
        return res.status(404).json({ message: 'No recipes found for the given ingredients.' });
      }
  
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

const deleteRecipe = async (req, res) => {
    try {
      const { userId } = req.body;
      const {recipeid} = req.params;
      
      // Validate required fields
      if (!recipeid || !userId) {
        return res.status(400).json({
          message: 'Missing required fields: userId and recipeid are both required',
          error: 'BAD_REQUEST'
        });
      }

      //ckeck if the id is in the right format 
      if (!mongoose.Types.ObjectId.isValid(recipeid)) {
      
        return res.status(400).json({
          message: 'Invalid recipe ID format',
          error: 'BAD_REQUEST'
        });
      }
      const recipe = await Recipe.findById(recipeid);
      
      if (!recipe) {
        return res.status(404).json({
          message: 'Recipe not found',
          error: 'NOT_FOUND'
        });
      }
  
      // Verify ownership
      if (userId.toString() !== recipe.recipe_user.toString()) {
        return res.status(403).json({
          message: 'You are not authorized to delete this recipe',
          error: 'FORBIDDEN'
        });
      }
  
      // Actually delete the recipe from the database
      await Recipe.findByIdAndDelete(recipeid);
  
      // Return success response
      return res.status(200).json({
        message: 'Recipe successfully deleted',
        success: true
      });
  
    } catch (error) {
      // Handle database errors
      console.error('Error deleting recipe:', error);
      return res.status(500).json({
        message: 'An error occurred while deleting the recipe',
        error: error.message,
        success: false
      });
    }
};

module.exports = {getRecipes , getRecipe , addRecipe 
    , editRecipe , deleteRecipe , searchRecipesByIngredients 
    , deleteRecipe , deleteAllRecipes , getUserRecipes
    ,searchRecipeByName , getMultipleRecipesData , getRecipesPerPage , getPopularRecipe};