const isSanitary = require("../validator.js").isSanitary;

const mongoose = require("mongoose");

const MerchantSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Owner",
        required: true
    },
    name: {
        type: String,
        required: [true, "MERCHANT NAME IS REQUIRED"],
        validate: {
            validator: isSanitary,
            message: "NAME CONTAINS ILLEGAL CHARACTERS"
        }
    },
    pos: {
        type: String,
        required: true
    },
    locationId: String,
    createdAt: {
        type: Date,
        default: new Date()
    },
    address: {
        full: String,
        city: String,
        state: String,
        zip: String
    },
    location: {
        type: {type: String},
        coordinates: [],
        required: false
    },
    inventory: [{
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient",
            required: [true, "MUST PROVIDE THE INGREDIENT"]
        },
        quantity: {
            type: Number,
            required: [true, "INGREDIENT QUANTITY IS REQUIRED"]
        }
    }],
    recipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe"
    }],
    removed: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Merchant", MerchantSchema);