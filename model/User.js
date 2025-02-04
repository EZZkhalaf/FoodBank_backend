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
                ref: "User",
            },
        ],
        followers: [
            {
                type: mongo.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        following: [
            {
                type: mongo.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        ownRecipes: [
            {
                type: mongo.Schema.Types.ObjectId,
                ref: "Recipe",
            },
        ],
        savedRecipes: [
            {
                type: mongo.Schema.Types.ObjectId,
                ref: "Recipe",
            },
        ],
        bio: {
            type: String,
            default: "New to the app",
        },
        profilePic: {
            type: String,
            default: "/assets/defaultPhoto.png", // Make sure this path is correct
        },
    },
    { timestamps: true }
);

module.exports = mongo.model("User", userSchema);
