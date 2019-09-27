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
                return res.render("merchantSetupPage/merchantSetup", {ingredients: ingredients});
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            })
    }
}