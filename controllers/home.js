const axios = require("axios");

const Merchant = require("../models/merchant");
const Ingredient = require("../models/ingredient");
const Recipe = require("../models/recipe");

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
                        console.log(recipes);
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
    },

    createMerchant: (req, res)=>{
        let newIngredient = [];
        let data = JSON.parse(req.body.data);
        for(let ingredient of data.new){
            newIngredient.push({
                name: ingredient.name,
                category: ingredient.category,
                unitType: ingredient.unitType
            });
        }

        Ingredient.create(newIngredient)
            .then((ingredients)=>{
                ingredientIds = [];
                for(let i = 0; i < ingredients.length; i++){
                    data.existing.push({
                        id: ingredient[i]._id,
                        quantity: data.new[i].quantity
                    });
                    ingredientIds.push({
                        tempId: data.new[i].id,
                        permId: ingredients[i]._id
                    });
                }

                Recipe.create()
                axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchantId}?access_token=${token}`)
                    .then((merchant)=>{
                        Merchant.create({
                            cloverId: merchant._id,
                            lastUpdateTime: Date.now,
                            ingredients: data.existing
                        })
                            .then((merchant)=>{
                                console.log(merchant);
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
                

            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    }
}