const axios = require("axios");

const Merchant = require("../models/merchant");
const Ingredient = require("../models/ingredient");

const merchantId = "HCVKASXH94531";
const token = "f1c88a69-e3e4-059a-da06-8858d0636e82";

module.exports = {
    displayInventory: (req, res)=>{
        Merchant.findOne({cloverId: merchantId})
            .populate("ingredients")
            .then((merchant)=>{
                if(merchant){
                    return res.render("inventory");
                }else{
                    return res.redirect("/merchant/new");
                }
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    merchantSetup: (req, res)=>{
        Ingredient.find()
            .then((ingredients)=>{
                axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchantId}/items?access_token=${token}`)
                    .then((recipes)=>{
                        return res.render("merchantSetupPage/merchantSetup", {ingredients: ingredients, recipes: recipes.data});
                    })
                    .catch((err)=>{
                        console.log(err);
                        return res.render("error");
                    });
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            })
    },

    getRecipes: (req, res)=>{
        axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchantId}/items?access_token=${token}`)
            .then((recipes)=>{
                
                return res.json(recipes);
            })
            .catch((err)=>{
                return res.json(err);
            });
    }
}