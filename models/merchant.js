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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ingredient"
    }]
});

module.exports = mongoose.model("Merchant", MerchantSchema);