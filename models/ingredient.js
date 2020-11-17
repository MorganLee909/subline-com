const helper = require("../controllers/helper.js");

const mongoose = require("mongoose");

let sanitary = (value)=>{
    return helper.isSanitary(value);
}

const IngredientSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 2,
        required: true,
        validate: {

        }
    },
    category: {
        type: String,
        minlength: 2,
        required: true
    },
    unitType: {
        type: String,
        required: true
    },
    specialUnit: String,
    unitSize: String
});

module.exports = mongoose.model("Ingredient", IngredientSchema);