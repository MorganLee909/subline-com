const mongoose = require("mongoose");

const MerchantSchema = new mongoose.Schema({
    cloverId: {
        type: String,
        required: true
    },
    lastUpdatedTime: {
        type: Date,
        default: Date.now
    },
    recipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe"
    }],
    ingredients: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient"
        },
        quantity: {
            type: Number,
            min: [0, "Quantity cannot be less than 0"]
        }
    }]
});

module.exports = mongoose.model("Merchant", MerchantSchema);