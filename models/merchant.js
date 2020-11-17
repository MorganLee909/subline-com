const helper = require("../controllers/helper.js");

const mongoose = require("mongoose");

let nameSanitary = (value)=>{
    return helper.isSanitary(value);
}

let emailValid = (value)=>{
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
}

const MerchantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate: {
            validator: nameSanitary,
            message: "NAME CONTAINS ILLEGAL CHARACTERS"
        }
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: emailValid,
            message: "INVALID EMAIL ADDRESS"
        }
    },
    password: {
        type: String,
        required: true,
    },
    pos: {
        type: String,
        required: true
    },
    posId: String,
    posAccessToken: String,
    lastUpdatedTime: {
        type: String,
        default: Date.now()
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: [],
    squareLocation: String,
    inventory: [{
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        defaultUnit: {
            type: String,
            required: true
        }
    }],
    recipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe"
    }],
    verifyId: String
});

module.exports = mongoose.model("Merchant", MerchantSchema);