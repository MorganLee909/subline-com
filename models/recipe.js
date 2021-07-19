const isSanitary = require("../validator.js").isSanitary;

const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
    posId: String,
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchant",
        required: [true, "MERCHANT IS REQUIRED"]
    },
    name: {
        type: String,
        minlength: [2, "RECIPE NAME MUST CONTAIN AT LEAST 2 CHARACTERS"],
        validate: {
            validator: isSanitary,
            message: "RECIPE NAME CONTAINS ILLEGAL CHARACTERS"
        },
        required: true
    },
    price: {
        type: Number,
        min: [0, "PRICE OF RECIPE CANNOT BE A NEGATIVE NUMBER"],
        required: [true, "RECIPE PRICE IS REQUIRED"]
    },
    category: {
        type: String,
        default: "",
        validate: {
            validator: isSanitary,
            message: "RECIPE CATEGORY CONTAINS ILLEGAL CHARACTERS"
        }
    },
    hidden: {
        type: Boolean,
        default: false
    },
    ingredients: [{
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient",
            required: [true, "INGREDIENT IS REQUIRED"]
        },
        quantity: {
            type: Number,
            min: [0, "QUANTITY OF INGREDIENTS CANNOT BE A NEGATIVE NUMBER"],
            required: [true, "MUST PROVED A QUANTITY FOR ALL INGREDIENTS"]
        },
        unit: String
    }]
});

module.exports = mongoose.model("Recipe", RecipeSchema);
