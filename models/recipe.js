const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
    cloverId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        minlength: [3, "Name of recipe must contain at least three characters"]
    },
    ingredients: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient",
            required: [true, "Must provide ingredient"]
        },
        quantity: {
            type: Number,
<<<<<<< HEAD
            min: [0, "Cannot have a negative quantity"],
            required: [true, "Must provide a quantity"]
=======
            min: [0, "Quantity cannot be a negative number"],
            required: true
>>>>>>> validation
        }
    }]
});

module.exports = mongoose.model("Recipe", RecipeSchema);