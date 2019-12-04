const mongoose = require("mongoose");

const ErrorSchema = new mongoose.Schema({
    code: Number,
    date: {
        type: Date,
        default: Date.now
    },
    displayMessage: String,
    error: {}
});

module.exports = mongoose.model("Error", ErrorSchema);