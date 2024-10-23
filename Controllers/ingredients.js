const Ingredient = require('../model/ingredient');

const addIngredient = async (req, res) => {
    const { ingredient_name, unit, ingredient_image } = req.body;

    // Ensure required fields are filled
    if (!ingredient_name || !unit) {
        return res.status(400).json({ message: "Please fill the required fields for the ingredient." });
    }

    try {
        // Check for an existing ingredient by name (case-insensitive)
        const existingIngredient = await Ingredient.findOne({ingredient_name});
        if (existingIngredient) {
            return res.status(400).json({ message: "Ingredient already exists!" });
        }

      
        

        // Create the new ingredient
        const newIngredient = await Ingredient.create({
            ingredient_name:ingredient_name,
            unit,
            ingredient_image
        });

        // Respond with the created ingredient details
        return res.status(201).json({message : 'ingredient added ....'});

    } catch (error) {
        // Return a detailed error message
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
};

module.exports = addIngredient;





// const ingredient = require('../model/ingredient');


// const addIngredient = async(req,res)=>{
//     const {ingredient_name , unit  , ingredient_image} = req.body;
//     if(!ingredient_name || !unit){
//         return res.status(400).json("please fill the required fields for the ingredient");
//     }

   
    
//     try {
//         //check for existing ingredient in the database 
//         const existIngredient = await ingredient.findOne({ingredient_name});
//         if(existIngredient){
//             return res.status(400).json("ingredient already exist !!!");
//         }
        
        
//         //creating the ingredient
//         const newIngredient =await ingredient.create({
//             ingredient_name , 
//             unit,
//             ingredient_image
//         })
        

//         return res.status(201).json({
//             ingredient_name : newIngredient.ingredient_name,
//             unit : newIngredient.unit,
//             ingredient_image : newIngredient.ingredient_image
//         });

//     } catch (error) {
//         res.status(400).json({message:'error in catch'});
//     }




// }

// module.exports = addIngredient;


