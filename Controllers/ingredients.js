const Ingredient = require('../model/ingredient');

// const addIngredient = async (req, res) => {
//     const { ingredient_name, unit } = req.body;

//     // Ensure required fields are filled
//     if (!ingredient_name || !unit) {
//         return res.status(400).json({ message: "Please fill the required fields for the ingredient." });
//     }

//     try {
//         // Check for an existing ingredient by name (case-insensitive)
//         const existingIngredient = await Ingredient.findOne({ingredient_name});
//         if (existingIngredient) {
//             return res.status(400).json({ message: "Ingredient already exists!" });
//         }

      
        

//         // Create the new ingredient
//         await Ingredient.create({
//             ingredient_name:ingredient_name,
//             unit
//         });

//         // Respond with the created ingredient details
//         return res.status(201).json({message : 'ingredient added ....'});

//     } catch (error) {
//         // Return a detailed error message
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
        // Check for existing ingredients by ingredient_name (case insensitive)
        const existingIngredients = await Ingredient.find({
            ingredient_name: { 
                $in: ingredients.map(ing => ing.name.toLowerCase()) // Use lowercase for comparison
            }
        });

        // Extract existing ingredient names and ensure they are case-insensitive
        const existingIngredientNames = existingIngredients.map(ing => ing.ingredient_name.toLowerCase());

        // Filter out ingredients that already exist
        const newIngredients = ingredients.filter(ing => !existingIngredientNames.includes(ing.name.toLowerCase()));

        // If there are new ingredients, insert them into the database
        if (newIngredients.length > 0) {
            const insertedIngredients = await Ingredient.insertMany(newIngredients.map(ing => ({
                ingredient_name: ing.name.toLowerCase(), // Ensure case consistency
                unit: ing.unit
            })));
            return res.status(201).json(insertedIngredients);
        }

        return res.status(400).json({ message: 'All ingredients already exist.' });

    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
};


module.exports = addIngredients;







