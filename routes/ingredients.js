const express = require('express');
const addIngredient= require('../Controllers/ingredients');
const router = express.Router();

router.post('/', addIngredient);

module.exports = router;