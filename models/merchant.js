const mongoose = require("mongoose");

const MerchantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    posId: {
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
            ref: "Ingredient",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [0, "Quantity cannot be less than 0"]
        }
    }],
    recipes: [{
        posId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
        },
        ingredients: [{
            ingredient: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Ingredient",
                required: [true, "Must provide ingredient"]
            },
            quantity: {
                type: Number,
                min: [0, "Cannot have a negative quantity"],
                required: [true, "Must provide a quantity"]
            }
        }]
    }]
});

module.exports = mongoose.model("Merchant", MerchantSchema);