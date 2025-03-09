const express = require('express');
const {addIngredients ,searchIngredient, getFirst30}= require('../Controllers/ingredients');
const router = express.Router();

router.post('/', addIngredients);
router.post('/searchIngredient' , searchIngredient)
router.get('/getFirst20', getFirst30)

module.exports = router;