const Ingredient = require('../model/ingredient');




// const addIngredients = async (req, res) => {
//     const { ingredients } = req.body;

//     // Ensure the body contains an array and each ingredient has a name and unit
//     if (!Array.isArray(ingredients) || ingredients.some(ingredient => !ingredient.name || !ingredient.unit)) {
//         return res.status(400).json({ message: 'Each ingredient must have a "name" and a "unit".' });
//     }

//     try {
//         // Check for existing ingredients by ingredient_name (case insensitive)
//         const existingIngredients = await Ingredient.find({
//             ingredient_name: { 
//                 $in: ingredients.map(ing => ing.name.toLowerCase()) // Use lowercase for comparison
//             }
//         }).collation({locale : 'en' , strength:2})

//         // Extract existing ingredient names and ensure they are case-insensitive
//         const existingIngredientNames = existingIngredients.map(ing => ing.ingredient_name.toLowerCase());

//         // Filter out ingredients that already exist
//         const newIngredients = ingredients.filter(ing => !existingIngredientNames.includes(ing.name.toLowerCase()));

//         // If there are new ingredients, insert them into the database
//         if (newIngredients.length > 0) {
//             const insertedIngredients = await Ingredient.insertMany(newIngredients.map(ing => ({
//                 ingredient_name: ing.name.toLowerCase(), // Ensure case consistency
//                 unit: ing.unit
//             })));
//             return res.status(201).json(insertedIngredients);
//         }

//         return res.status(400).json({ message: 'All ingredients already exist.' });

//     } catch (error) {
//         return res.status(500).json({ message: `Error: ${error.message}` });
//     }
// };




const addIngredients = async (req, res) => {
    const { ingredients } = req.body;

    // Ensure the body contains an array and each ingredient has a name and unit
    if (!Array.isArray(ingredients) || ingredients.some(ingredient => !ingredient.name || !ingredient.unit)) {
        return res.status(400).json({ message: 'Each ingredient must have a "name" and a "unit".' });
    }

    try {
        // Iterate over the ingredients
        for (let ingredient of ingredients) {
            // Check for existing ingredients by ingredient_name (case insensitive)
            const existingIngredient = await Ingredient.findOne({
                ingredient_name: ingredient.name.toLowerCase(), // Use lowercase for comparison
            }).collation({ locale: 'en', strength: 2 });

            if (existingIngredient) {
                // If the ingredient exists, update it (replace or modify as needed)
                await Ingredient.findOneAndUpdate(
                    { ingredient_name: existingIngredient.ingredient_name }, // Match the existing ingredient by name
                    { $set: { unit: ingredient.unit } }, // Update the unit field (you can add more fields if necessary)
                    { new: true } // Return the updated document
                );
            } else {
                // If the ingredient doesn't exist, create a new one
                await Ingredient.create({
                    ingredient_name: ingredient.name.toLowerCase(), // Ensure case consistency
                    unit: ingredient.unit,
                });
            }
        }

        return res.status(200).json({ message: 'Ingredients processed successfully' });

    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
};


module.exports = addIngredients;







