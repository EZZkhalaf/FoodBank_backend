const express = require('express');
const addIngredients= require('../Controllers/ingredients');
const router = express.Router();

router.post('/', addIngredients);

module.exports = router;