
const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchant",
        required: [true, "MERCHANT IS REQUIRED FOR A TRANSACTION"]
    },
    date: {
        type: Date,
        required: [true, "DATE MUST BE PROVIDED FOR A TRANSACTION"],
        validate: {
            validator: date => date < new Date,
            message: "TRANSACTION DATE CANNOT BE SET TO THE FUTURE"
        }
    },
    device: String,
    recipes: [{
        recipe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recipe"
        },
        quantity: {
            type: Number,
            min: [0, "RECIPE QUANTITIES MUST BE A POSITIVE NUMBER"]
        }
    }],
    posId: String
});

module.exports = mongoose.model("Transaction", TransactionSchema);