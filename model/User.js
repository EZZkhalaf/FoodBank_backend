const mongo = require("mongoose");


const userSchema = new  mongo.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    favorites: [{ 
        type: mongo.Schema.Types.ObjectId, 
        ref: 'Recipe' 
    }],
} , {Timestamp:true});

module.exports = mongo.model('User' , userSchema);