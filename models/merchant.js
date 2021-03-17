const isSanitary = require("../controllers/helper.js").isSanitary;

const mongoose = require("mongoose");

let emailValid = (value)=>{
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
}

const MerchantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "MERCHANT NAME IS REQUIRED"],
        validate: {
            validator: isSanitary,
            message: "NAME CONTAINS ILLEGAL CHARACTERS"
        }
    },
    email: {
        type: String,
        required: [true, "EMAIL IS REQUIRED"],
        validate: {
            validator: emailValid,
            message: "INVALID EMAIL ADDRESS"
        },
        index: true
    },
    password: String,
    pos: {
        type: String,
        required: true
    },
    square: {
        id: String,
        accessToken: String,
        expires: Date,
        refreshToken: String,
        location: String
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    status: [],
    inventory: [{
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient",
            required: [true, "MUST PROVIDE THE INGREDIENT"]
        },
        quantity: {
            type: Number,
            required: [true, "INGREDIENT QUANTITY IS REQUIRED"]
        },
        defaultUnit: {
            type: String,
            required: [true, "INGREDIENT UNIT IS REQUIRED"]
        }
    }],
    recipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe"
    }],
    session: {
        sessionId: {
            type: String,
            index: true
        },
        expiration: Date
    }
});

module.exports = mongoose.model("Merchant", MerchantSchema);