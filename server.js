const express = require('express');
const dotenv = require('dotenv').config();
const connectdb = require('./Config/mongoConnect');
const jwt = require('jsonwebtoken')

const app = express();
const PORT = process.env.PORT || 5000;
connectdb();

app.use(express.json())

app.use('/recipe' ,require("./routes/recipe"));
app.use('/user' , require('./routes/user'));
// app.use('/ingredients' , require('./routes/ingredients'));


app.listen(PORT , (err) =>{
    console.log(`running in PORT ${PORT}`)
})


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
// │
// ├── /users
// │   ├── POST /register   - Register a new user
// │   ├── POST /login      - Log in a user
// │   ├── GET /:id/favorites - Get a user's favorite recipes
// │   └── POST /:id/favorites - Add a recipe to user’s favorites
// │
