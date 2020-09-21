const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 2,
        required: true
    },
    category: {
        type: String,
        minlength: 3,
        required: true
    },
    unitType: {
        type: String,
        required: true
    },
    specialUnit: {
        type: String,
        required: false
    },
    unitSize:{
        type: Number,
        required: false
    }
});

module.exports = mongoose.model("Ingredient", IngredientSchema);