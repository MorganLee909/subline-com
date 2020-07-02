const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 2,
        required: true
    },
    category: {
        type: String,
        minlength: 3
    },
    unit: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Ingredient", IngredientSchema);