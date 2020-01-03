const mongoose = require("mongoose");

const RecipeChangeSchema = new mongoose.Schema({
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
        required: true
    },
    ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ingredient",
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("RecipeChange", RecipeChangeSchema);