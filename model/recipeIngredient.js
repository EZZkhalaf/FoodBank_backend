const mongoose = require('mongoose');

const recipeIngredientSchema = new mongoose.Schema({
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  quantity: { type: Number, required: true }
});

module.exports = mongoose.model('RecipeIngredient', recipeIngredientSchema);
