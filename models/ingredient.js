const isSanitary = require("../validator.js").isSanitary;

const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: [2, "INGREDIENT NAME MUST CONTAIN AT LEAST 2 CHARACTERS"],
        required: [true, "INGREDIENT NAME IS REQUIRED"],
        validate: {
            validator: isSanitary,
            message: "INGREDIENT NAME CONTAINS ILLEGAL CHARACTERS"
        }
    },
    category: {
        type: String,
        minlength: [2, "INGREDIENT CATEGORY MUST CONTAIN AT LEAST 2 CHARACTERS"],
        required: [true, "INGREDIENT CATEGORY IS REQUIRED"],
        validate: {
            validator: isSanitary,
            message: "INGREDIENT CATEGORY CONTAINS ILLEGAL CHARACTERS"
        }
    },
    unit: {
        type: String,
        required: true
    },
    convert: {
        toMass: Number,
        toVolume: Number,
        toLength: Number
    },
    ingredients: [{
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        }
    }],
});

module.exports = mongoose.model("Ingredient", IngredientSchema);