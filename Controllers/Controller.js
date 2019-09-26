const mongoose = require("mongoose");
const Ingredient = require("../Models/Ingredient");

const merchantId = "HCVKASXH94531";
const token = "f1c88a69-e3e4-059a-da06-8858d0636e82";

module.exports = {
    getIngredients: (req, res)=>{
        Ingredient.find()
            .then((ingredients)=>{
                return res.json(ingredients);
            })
            .catch((err)=>{
                return res.json(err);
            });
    },

    createIngredient: (req, res)=>{
        Ingredient.create(req.body)
            .then((ingredient)=>{
                return res.json(ingredient);
            })
            .catch((err)=>{
                return res.json(err);
            });
    }
}