const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: [2, "Name of ingredient is too short.  Please have at least two characters"],
        required: [true, "Must provide a name for the ingredient"]
    },
    category: {
        type: String,
        minlength: [3, "Category name must contain at least three characters"]
    },
    unit: {
        type: String,
        required: [true, "You must provide the measurement unit for this item"]
    }
});

module.exports = mongoose.model("Ingredient", IngredientSchema);