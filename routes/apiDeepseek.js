const express = require('express');
const router = express.Router();

const improveInstructions = require('../Controllers/ApiDeepseek');

router.post('/improveInstructions', improveInstructions);

module.exports = router;
