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
    unitType: {
        type: String,
        required: true
    },
    unitSize:{
        type: Number,
        required: false
    }
});

module.exports = mongoose.model("Ingredient", IngredientSchema);