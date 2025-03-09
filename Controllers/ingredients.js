const ingredient = require('../model/ingredient');
const Ingredient = require('../model/ingredient');
const { options } = require('../routes/user');




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




const searchIngredient = async(req,res)=>{
    const {ingredient_name} = req.body;

    if(!ingredient_name)  return res.status(400).json('no ingredient provided !');
    try { 
        const foundIngredients =await Ingredient.find({ingredient_name : {$regex : ingredient_name , $options:'i'}});
        if(!foundIngredients){
            return res.status(404).json('no ingredients found ')
            console.log('no ing fownd')
        }
        return res.status(200).json(foundIngredients)
        
    } catch (error) {
        return res.status(500).json(error)
    }
    


}


const getFirst30 = async (req,res)=>{
    try {
        const ingredients = await ingredient.find().limit(20);
        return res.status(200).json(ingredients);
        
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving ingredients'});
    }
}


module.exports = {addIngredients , searchIngredient , getFirst30};







