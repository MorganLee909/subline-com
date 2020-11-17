const helper = require("../controllers/helper.js");

const mongoose = require("mongoose");

let sanitary = (value)=>{
    return helper.isSanitary(value);
}

const IngredientSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: [2, "INGREDIENT NAME MUST CONTAIN AT LEAST 2 CHARACTERS"],
        required: [true, "INGREDIENT NAME IS REQUIRED"],
        validate: {
            validator: sanitary,
            message: "INGREDIENT NAME CONTAINS ILLEGAL CHARACTERS"
        }
    },
    category: {
        type: String,
        minlength: [2, "INGREDIENT CATEGORY MUST CONTAIN AT LEAST 2 CHARACTERS"],
        required: [true, "INGREDIENT CATEGORY IS REQUIRED"],
        validate: {
            validator: sanitary,
            message: "INGREDIENT CATEGORY CONTAINS ILLEGAL CHARACTERS"
        }
    },
    unitType: {
        type: String,
        required: true
    },
    specialUnit: String,
    unitSize: String
});

module.exports = mongoose.model("Ingredient", IngredientSchema);