
const express = require('express')
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const getAllUsers = async(req,res) =>{
   return  res.json({message:"get all users"})
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


module.exports = {getAllUsers , CreateUser , loginUser};