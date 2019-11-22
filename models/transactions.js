const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, "Must provide date and time transacted"]
    },
    recipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe"
    }]
});

module.exports = mongoose.model("Transaction", TransactionSchema);