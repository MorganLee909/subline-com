const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchant",
        required: true
    },
    name: String,
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    taxes: {
        type: Number,
        required: true
    },
    fees: {
        type: Number,
        required: true
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
        },
        pricePerUnit: {
            type: Number,
            min: 0
        }
    }]
});

module.exports = mongoose.model("Order", OrderSchema);