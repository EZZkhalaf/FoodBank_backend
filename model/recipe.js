const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    recipe_title:{
        type:String,
        required:true,
        unique:false
    },
    recipe_description:{
           type:String ,
           required:true,
    },
    recipe_image:{
        type:String ,
        required:false,
    },
    instructions:{
        type:String,
        required:true,
    },
    ingredients:[{
        name : {
            type : String ,
            required : true
        },
        quantity : {
            type:String ,
            required : true
        },
        unit : {
            type : String,
            required:false
        }
    }],
    recipe_user:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }] ,
    type:{
        type:String , 
        required : true 
    },
    Bookmarks:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    cookingTime:{
        type: Number ,
        required : true ,
        min  : [1,'Cooking time must be at least 1 minute'],
        default : 30
    },
    difficullty:{
        type: String ,
        required:true ,
        default:'medium'
    }
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);


