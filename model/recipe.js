

const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    instructions: String,
    ingredients: [{
        ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
        quantity: Number,
    }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imgURL: String,
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
