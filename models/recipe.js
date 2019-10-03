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
    ingredients: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient"
        },
        quantity: {
            type: Number,
            required: true
        }
    }]
});

module.exports = mongoose.model("Recipe", RecipeSchema);