const axios = require("axios");

const Merchant = require("../models/merchant");
const Ingredient = require("../models/ingredient");
const Recipe = require("../models/recipe");

const merchantId = "HCVKASXH94531";
const token = "f1c88a69-e3e4-059a-da06-8858d0636e82";

module.exports = {
    displayInventory: (req, res)=>{
        Merchant.findOne({cloverId: merchantId})
            .populate("inventory.ingredient")
            .then((merchant)=>{
                if(merchant){
                    return res.render("inventory/inventory", {merchant: merchant});
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
    },

    createMerchant: (req, res)=>{
        let data = JSON.parse(req.body.data);

        Recipe.create(data.recipes)
            .then((recipes)=>{
                axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchantId}?access_token=${token}`)
                    .then((merchant)=>{
                        console.log(merchant.data);
                        let newMerchant = new Merchant({
                            name: merchant.data.name,
                            cloverId: merchant.data.id,
                            lastUpdateTime: Date.now,
                            inventory: [],
                            recipes: []
                        });

                        for(let ingredient of data.ingredients){
                            let newIngredient = {
                                ingredient: ingredient.id,
                                quantity: parseInt(ingredient.quantity)
                            }
                            newMerchant.inventory.push(newIngredient);
                        }

                        for(let recipe of recipes){
                            newMerchant.recipes.push(recipe._id);
                        }

                        newMerchant.save()
                            .then((newMerchant)=>{
                                return res.redirect("/");
                            })
                            .catch((err)=>{
                                console.log(err);
                                return res.render("error");
                            })
                    })
                    .catch((err)=>{
                        console.log(err);
                    });
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    createNewIngredients: (req, res)=>{
        Ingredient.create(req.body)
            .then((ingredients)=>{
                return res.json(ingredients);
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    }
}