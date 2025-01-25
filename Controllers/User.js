
const express = require('express')
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const Recipe = require('../model/recipe')
const {deleteRecipe} = require('../Controllers/Recipe')

const getAllUsers = async(req,res) =>{
   return  res.json({message:"get all users"})
}



const searchUser = async(req,res) =>{
    const {username} = req.body;

    if(!username){
        return res.status(400).json('enter username .');
    }
    
    try{
        //this statement to find the users whom contain the search name or a part of it 
        const users = await User.find({username : {$regex : username , $options: 'i'}});
        if(!users || users.length === 0 ){
            return res.status(404).json('no users found');
        }

        return res.status(200).json(users);

    }catch(err){
        return res.status(500).json({message: 'server error' , error : err});
    }
}


const CreateUser = async (req,res)=>{
    const {username , email , password , ConfirmPass} = req.body;
    if(!username || !email || !password || !ConfirmPass){
        return res.status(400).json("please fill the required fields");
    }

    if (password !== ConfirmPass) {
        return res.status(400).json("Passwords do not match.");
    }


    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email , 
            password:hashedPassword
        })


        //respond with the created user 
        return res.status(201).json({
            user_id: newUser._id,
            user_name: newUser.user_name,
            email: newUser.email,
        });


    } catch (error) {
        return res.status(400).json(error.message);
    }
}




const loginUser = async(req,res)=>{
    const {email , password} = req.body;


    try {
        
        const login_user = await User.findOne({email});
        
        if (!login_user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password , login_user.password);

        if(!isMatch){
            return res.status(401).json({ message: "Invalid password" });
        }


        
        //will add jwt later 
        const token = jwt.sign({ id: login_user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return success response with token
        return res.json('login working ');

    } catch (error) {
        return res.status(400).json(error.message)
    }
}


const followUser = async(req,res)=>{
    const {currentuserid , followinguserid} = req.body;
    try{
        const currentuser = await User.findById(currentuserid);
        const followingUser = await User.findById(followinguserid);
        
        if(!currentuser ){
            return res.status(404).json('no current user please log in')
        }
        if(!followingUser){
            return res.status(404).json('user not found')
        }
        
        
        if(currentuser.following.includes(followinguserid)){
            return res.status(409).json('user already added ')
        }

        currentuser.following.push(followinguserid);
        followingUser.followers.push(currentuserid);
        await currentuser.save();
        await followingUser.save();

        return res.status(200).json('user added successfully')

    }catch(err){
        return res.status(500).json({message:"server error " , error :err})
    }
}





const unsaveRecipe = async(req,res)=>{
    const { currentUserid, RecipeId } = req.body;

    if (!currentUserid || !RecipeId) {
        return res.status(400).json({ message: 'User ID and Recipe ID are required.' });
    }

    try {
        // Remove the RecipeId from the savedRecipes array
        const updatedUser = await User.findByIdAndUpdate(
            currentUserid,
            { $pull: { savedRecipes: RecipeId } }, // Remove RecipeId from savedRecipes array
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({ message: 'Recipe removed from saved recipes successfully.' });
    } catch (error) {
        return res.status(500).json({ message: 'Error removing recipe', error: error.message });
    }
}

const saveRecipe = async(req,res) =>{
    const {currentUserid , RecipeId} = req.body;
    const recipe77 = await Recipe.findById(RecipeId);
    const currentUser = await User.findById(currentUserid);
    
    //check if they exist
    if (!currentUser) return res.status(404).json({ message: 'Please login' });
    if (!recipe77) res.status(500).json('error in finding recipe to save')
    
    
    try {
        const existingRecipe =  currentUser.savedRecipes.some(recipe => recipe._id.equals(RecipeId))

        if(existingRecipe) return res.status(500).json('already at the book marks')


        currentUser.savedRecipes.push(RecipeId);
        await currentUser.save();


        recipe77.Bookmarks.push(currentUserid);
        await recipe77.save();
        console.log('test')

        return res.status(200).json({message:'added to bookmarks'})

    } catch (err) {
        return res.status(500).json({message:'server error' , error:err});
    }

}

const deleteOwnRecipe = async(req,res)=>{
    const {currentUserid , RecipeId} = req.body;
    if (!currentUserid || !RecipeId) {
        return res.status(400).json('User ID and Recipe ID are required'); // 400 for bad request
    }
    try{
    const currentUser = await User.findById(currentUserid);
    if(!currentUser) return res.status(500).json('please log in to delete your own recipes');

    //finding the index of the desired recipe
    const deleteRecipeIndex = currentUser.ownRecipes.findIndex(recipe => recipe._id.equals(RecipeId));
    if(deleteRecipeIndex === -1){
        return res.status(404).json('recipe not found');
    }

    // removing the recipe by the index in the current user selection
    currentUser.ownRecipes.splice(deleteRecipeIndex , 1);
    await currentUser.save();
    
    return res.status(200).json('successfully deleted the recipe');
    

    }catch(err){
        return res.status(500).json({ message: 'Error deleting recipe', error: error.message });
    }
}

module.exports = {getAllUsers , CreateUser , loginUser , searchUser , followUser , saveRecipe , unsaveRecipe,deleteOwnRecipe};