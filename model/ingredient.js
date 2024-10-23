const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    ingredient_name: {
        type: String,
        required: true,
        unique: true,
        
    },
    unit: {
        type: String, // E.g., "grams", "pieces", "ml", etc.
        required: true,
    },
    ingredient_image:{
        type:String,
        required : false,
        trim:true //remove white spaces
    }
}, { timestamps: true });


//each ingredient have an id that automatically assigned to it in mongo db
module.exports = mongoose.model('Ingredient', ingredientSchema);


