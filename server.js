const express = require('express');
const dotenv = require('dotenv').config();
const connectdb = require('./Config/mongoConnect');
const jwt = require('jsonwebtoken')
const cors = require('cors');

const app = express();
app.use(cors())

const PORT = process.env.PORT || 5000;
connectdb();

app.use(express.json())

app.use('/recipe' ,require("./routes/recipe"));
app.use('/user' , require('./routes/user'));
app.use('/ingredients' , require('./routes/ingredients'));


app.listen(PORT , (err) =>{
    console.log(`running in PORT ${PORT}`)
})


module.exports = app;

// /api
// ├── /ingredients
// │   ├── POST /           - Add ingredients entered by the user
// │   └── GET /suggestions - Get ingredient suggestions (optional feature)
// │
// ├── /recipes
// │   ├── GET /            - Get all recipes (with optional filters)
// │   ├── POST /search     - Search recipes based on user ingredients
// │   ├── GET /:id         - Get recipe details by recipe ID
// │   └── POST /           - Add a new recipe (admin or user-uploaded)
// │   └── POST /recipes/:id/reviews - Add a review or rating for a recipe(not added yet)
// │   └──GET /recipes/:id/reviews - Get all reviews for a recipe(not added yet)
// │
// ├── /users
// │   ├── POST /register   - Register a new user
// │   ├── POST /login      - Log in a user
// │   ├── GET /:id/favorites - Get a user's favorite recipes
// │   └── POST /:id/favorites - Add a recipe to user’s favorites
// |   └── PUT /users/:id - Update user profile information(not added yet )
// |   └──DELETE /users/:id - Delete user account(not added yet)
// |   └──POST /users/:id/shopping-list - Add ingredients to a shopping list(ot added yet)


//will be added search by user name 
