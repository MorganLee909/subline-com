const mongoose = require("mongoose");

const MerchantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    cloverId: {
        type: String,
        required: true
    },
    lastUpdatedTime: {
        type: String,
        default: Date.now()
    },
    inventory: [{
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient"
        },
        quantity: {
            type: Number,
            min: [0, "Quantity cannot be less than 0"],
            required: true
        }
    }],
    recipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe"
    }]
});

module.exports = mongoose.model("Merchant", MerchantSchema);