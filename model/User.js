const mongo = require("mongoose");


const userSchema = new mongo.Schema(
    {
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
        friends: [
            {
                type: mongo.Schema.Types.ObjectId,
                ref: "User", // Refers to other users in the same collection
            },
        ],
        followers: [
            {
                type: mongo.Schema.Types.ObjectId,
                ref: "User", // Refers to users who follow this user
            },
        ],
        following: [
            {
                type: mongo.Schema.Types.ObjectId,
                ref: "User", // Refers to users this user is following
            },
        ],
        ownRecipes : [
            {
                type:mongo.Schema.Types.ObjectId ,
                ref:'Recipe'
            }
        ],
        savedRecipes: [
            {
                type: mongo.Schema.Types.ObjectId,
                ref: "Recipe",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongo.model("User", userSchema);
