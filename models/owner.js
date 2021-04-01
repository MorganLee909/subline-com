const mongoose = require("mongoose");

let emailValid = require("../validator.js").emailValid;
let isSanitary = require("../validator.js").isSanitary;

const OwnerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "EMAIL IS REQUIRED"],
        validate: {
            validator: emailValid,
            message: "INVALID EMAIL ADDRESS"
        },
        index: true
    },
    name: {
        type: String,
        required: [true, "MUST PROVIDE AN OWNER NAME"],
        validate: {
            validator: isSanitary,
            message: "OWNER NAME CONTAINS ILLEGAL CHARACTERS"
        }
    },
    password: {
        type: String,
        required: true
    },
    square: {
        id: String,
        accessToken: String,
        expires: Date,
        refreshToken: String,
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    status: [],
    session: {
        sessionId: {
            type: String,
            index: true
        },
        expiration: Date
    },
    merchants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchant"
    }]
});

module.exports = mongoose.model("Owner", OwnerSchema);