const isSanitary = require("../controllers/helper.js").isSanitary;

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
    unitType: {
        type: String,
        required: [true, "UNIT TYPE IS REQUIRED"]
    },
    unitSize: {
        type: Number,
        min: [0, "SIZE CANNOT BE A NEGATIVE NUMBER"]
    }
});

module.exports = mongoose.model("Ingredient", IngredientSchema);