const isSanitary = require("../controllers/helper.js").isSanitary;

const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchant",
        required: [true, "MUST PROVIDE THE MERCHANT"]
    },
    name: {
        type: String,
        minlength: [2, "ORDER NAME MUST CONTAIN AT LEAST 2 CHARACTERS"],
        validate: {
            validator: isSanitary,
            message: "ORDER NAME CONTAINS ILLEGAL CHARACTERS"
        }
    },
    date: {
        type: Date,
        required: [true, "MUST PROVIDE A DATE FOR THE ORDER"],
        validate: {
            validator: date => date < new Date,
            message: "ORDER DATE CANNOT BE SET TO THE FUTURE"
        }
    },
    taxes: Number,
    fees: Number,
    ingredients: [{
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient",
            required: [true, "MUST PROVIDE THE INGREDIENT"]
        },
        quantity: {
            type: Number,
            required: [true, "MUST PROVIDE THE QUANTITY FOR EVERY INGREDIENT IN THE ORDER"],
            min: [0, "INGREDIENT QUANTITY IN AN ORDER CANNOT BE LESS THAN 0"]
        },
        pricePerUnit: {
            type: Number,
            min: [0, "PRICE PER UNIT CANNOT BE A NEGATIVE NUMBER"]
        }
    }]
});

module.exports = mongoose.model("Order", OrderSchema);