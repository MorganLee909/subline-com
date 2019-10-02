const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
    cloverId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        minlength: [3, "Name of recipe must contain at least three characters"]
    },
    // merchant: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Merchant"
    // },
    ingredients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ingredient"
    }]
});

module.exports = mongoose.model("Recipe", RecipeSchema);