const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchant",
        required: [true, "Transaction must contain a reference to a merchant"]
    },
    date: {
        type: Date,
        required: [true, "Must provide date and time transacted"]
    },
    device: {
        type: String,
        required: [true, "Transactions must record the device used"]
    },
    recipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe"
    }]
});

module.exports = mongoose.model("Transaction", TransactionSchema);