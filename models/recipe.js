const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
    posId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    ingredients: [{
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient",
            required: [true, "Must provide ingredient"]
        },
        quantity: {
            type: Number,
            min: [0, "Cannot have a negative quantity"],
            required: [true, "Must provide a quantity"]
        }
    }]
});

module.exports = mongoose.model("Recipe", RecipeSchema);