
const express = require('express');
const Recipe = require("../model/recipe");


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




const addRecipe = async (req, res) => {
    const { title, description, instructions, ingredients, user_id, imgURL } = req.body;

    // Check for required fields
    if (!title || !instructions || !ingredients) {
        return res.status(400).json({ message: 'Required fields are empty ...' });
    }

    try {
        // Create a new recipe
        const newRecipe = await Recipe.create({
            title,
            description,
            instructions,
            ingredients,
            user: user_id, // Ensure to include the user field if needed
            imgURL: imgURL // Add the image URL here
        });

        // Respond with the created recipe
        return res.status(201).json(newRecipe);
    } catch (error) {
        // Handle any errors that occur during creation
        return res.status(500).json({ message: 'Error creating recipe', error: error.message });
    }
};



const editRecipe = async(req,res)=>{
    const { title, ingredients , instructions , description} = req.body;
    let recipe = await Recipe.findById(req.params.id);

    try {
        if(recipe){
            await Recipe.findByIdAndUpdate(req.params.id , req.body , {new:true});
            res.json({title , ingredients , instructions , description});
        }


    } catch (error) {
        return res.status(400).json(error.message);
    }

}



const deleteRecipe = (req,res)=>{
    res.json({message : 'this is delete recipe'})

}
module.exports = {getRecipes , getRecipe , addRecipe , editRecipe , deleteRecipe};