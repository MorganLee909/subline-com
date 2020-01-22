const mongoose = require("mongoose");

let NonPosTransactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, "Must provide a date and time"]
    },
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchant",
        required: [true, "Log must contain a reference to a merchant"]
    },
    recipes: [{
        recipe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recipe"
        },
        quantity: {
            type: Number,
            required: [true, "Must provide the number sold for each recipe"],
            min: [0, "Must be a positive number"]
        }
    }]
});

module.exports = mongoose.model("NonPOSTransaction", NonPosTransactionSchema);