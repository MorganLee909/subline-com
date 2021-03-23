const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchant",
        required: true
    },
    title: {
        type: String,
        required: [true, "FEEDBACK MUST CONTAIN A TITLE"]
    },
    content: {
        type: String,
        required: [true, "MESSAGE TOO SHORT"],
        minLength: [10, "MESSAGE TOO SHORT"]
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model("Feedback", FeedbackSchema);