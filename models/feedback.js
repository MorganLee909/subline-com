const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchant",
        required: true
    },
    title: {
        type: String,
        required: [true, "FEEDBACK MUST CONTAIN A TITLE"]
    },
    contents: {
        type: String,
        require: [true, "MESSAGE TOO SHORT"]
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model("Feedback", FeedbackSchema);