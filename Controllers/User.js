
const express = require('express')
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const Recipe = require('../model/recipe')
const {deleteRecipe} = require('../Controllers/Recipe')
const {generateTokenAndSetCookie} = require('../lib/utils/gentoken.js')

const getAllUsers = async(req,res) =>{
   return  res.json({message:"get all users"})
}



const editProfile = async(req,res)=>{
    //to be continued
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


const getUserById = async(req,res)=>{
    const {userId} = req.body;
    if(!userId){
        return res.status(404).json('user not found');
    }
    try {
        const user = await User.findById(userId);
        if(!user || user.length === 0 ){
            return res.status(404).json('user not found for this recipe');
        }
        return res.status(200).json(user);
    } catch (err) {
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
        const existing_email = await User.findOne({email});
        if (existing_email){
            return res.status(500).json('email already registered ')
        }
        

        const existing_username = await User.findOne({username});
        if(existing_username){
            return res.status(500).json('user name already taken  ')

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email , 
            password:hashedPassword
        })

        generateTokenAndSetCookie(newUser._id , res);//generating the cookies for every new user

        
        return res.json({
            message: 'Register successful!',
        });


    } catch (error) {
        return res.status(400).json(error.message);
    }
}




const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    if (email === '' || password.length === 0) {
        return res.status(500).json({ message: 'Please fill the required fields' });
    }

    try {
        // Find user by email and populate related data
        const login_user = await User.findOne({ email })
            .populate('friends')
            .populate('followers')
            .populate('following')
            .populate('ownRecipes')
            .populate('savedRecipes');

        if (!login_user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, login_user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: login_user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });


        // console.log('Profile Pic in Backend:', login_user.profilePic);

        // Return success response with user data and token
        return res.json({
            message: 'Login successful!',
            token,
            user: {
              _id: login_user._id,
              username: login_user.username,
              email: login_user.email,
              friends: login_user.friends,
              followers: login_user.followers,
              following: login_user.following,
              ownRecipes: login_user.ownRecipes,
              savedRecipes: login_user.savedRecipes,
              bio: login_user.bio,
              profilePic: login_user.profilePic,  // Ensure this field is sent
              createdAt: login_user.createdAt,
              updatedAt: login_user.updatedAt,
            },
          });
          

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};



const logout = async(req,res)=>{
    try {
        res.cookie("jwt" , "" , {maxAge : 0 });
        return res.status(200).json("logged out seccessfully")
    } catch (error) {
        return res.status(500).json({Error:err})
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


const checkSaved = async(req,res)=>{ //this controller for checking if the user already bookmarked the recipe or no (for frontend part)
    const {recipeId , userId} = req.body;
        
    
    
    try {
        const recipe77 = await Recipe.findById(recipeId);
        const currentUser = await User.findById(userId);
        
        //check if they exist
        if (!currentUser) return res.status(404).json({ message: 'user not found' });
        if (!recipe77) res.status(500).json('error in finding recipe to save');
        const existingRecipe =  currentUser.savedRecipes.some(recipe => recipe._id.equals(recipeId))

        if(existingRecipe) return res.status(200).json('saved')
        // console.log(existingRecipe)
        if(!existingRecipe) return res.status(200).json('not saved')
    } catch (error) {
        return res.status(500).json({message:'server error' , error:err});
    }

}

const getSavedRecipes = async(req,res)=>{
    const {userid} = req.params;
    if(!userid) return res.status(500).json('no user found!');
    try {
        const currentUser = await User.findById(userid);
        if(!currentUser) return res.status(404).json('no user found with this id ');
        
        return res.status(200).json(currentUser.savedRecipes);
    
    } catch (error) {
        throw new Error({error:error})
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
        // console.log('test')

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

module.exports = {getAllUsers , CreateUser , 
    loginUser , searchUser , followUser , saveRecipe ,
    unsaveRecipe,deleteOwnRecipe , logout, getUserById,
    checkSaved , getSavedRecipes};

