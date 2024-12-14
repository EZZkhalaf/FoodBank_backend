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
    }]
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);

