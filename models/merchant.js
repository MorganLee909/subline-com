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
        quantity: String
    }]
});

module.exports = mongoose.model("Merchant", MerchantSchema);