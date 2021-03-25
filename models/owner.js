const mongoose = require("mongoose");

let emailValid = (value)=>{
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
}

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