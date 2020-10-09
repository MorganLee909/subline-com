const mongoose = require("mongoose");

const ArchivedRecipeSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchant",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    ingredients: [{
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient",
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }]
});

module.exports = mongoose.model("RecipeChange", ArchivedRecipeSchema);