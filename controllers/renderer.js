const axios = require("axios");

const Merchant = require("../models/merchant");
const Ingredient = require("../models/ingredient");
const Transaction = require("../models/transaction");

const token = "b48068eb-411a-918e-ea64-52007147e42c";

module.exports = {
    //GET - Shows the public landing page
    //Returns: 
    //  Error: a single error message
    //Renders landingPage
    landingPage: function(req, res){
        let error = {};
        if(req.session.error){
            error = req.session.error;
            req.session.error = undefined;
        }else{
            error = undefined;
        }

        return res.render("landingPage/landing", {error: error});
    },

    //GET - Displays the main inventory page for merchants
    //Returns:
    //  merchant: the logged in merchant
    //Renders inventoryPage
    displayInventory: function(req, res){
        if(!req.session.user){
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .populate("inventory.ingredient")
            .populate("recipes")
            .then((merchant)=>{
                if(merchant.pos === "clover"){
                    axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchant.posId}/orders?filter=clientCreatedTime>=${merchant.lastUpdatedTime}&expand=lineItems&access_token=${token}`)
                        .then((result)=>{
                            let transactions = [];

                            for(let order of result.data.elements){
                                let newTransaction = new Transaction({
                                    merchant: merchant._id,
                                    date: new Date(order.createdTime),
                                    device: order.device.id
                                });

                                for(let item of order.lineItems.elements){
                                    let recipe = merchant.recipes.find(r => r.posId === item.item.id);
                                    if(recipe){
                                        newTransaction.recipes.push(recipe._id);
                                        for(let ingredient of recipe.ingredients){
                                            let inventoryIngredient = {};
                                            for(let invItem of merchant.inventory){
                                                if(invItem.ingredient._id.toString() === ingredient.ingredient.toString()){
                                                    inventoryIngredient = invItem;
                                                }
                                            }
                                            inventoryIngredient.quantity -= ingredient.quantity;
                                        }
                                    }
                                }

                                transactions.push(newTransaction);
                            }
                            merchant.lastUpdatedTime = Date.now();

                            merchant.save()
                                .then((updatedMerchant)=>{
                                    res.render("inventoryPage/inventory", {merchant: updatedMerchant});
                                    Transaction.create(transactions);
                                    return;
                                })
                                .catch((err)=>{
                                    console.log(err);
                                    return res.render("error");
                                });
                        })
                        .catch((err)=>{
                            console.log(err);
                        });
                }else if(merchant.pos === "none"){
                    return res.render("inventoryPage/inventory", {merchant: merchant})
                }else{
                    return res.redirect("/");
                }
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    //GET - Renders the merchant setup page for a clover client
    //Returns:
    //  ingredients: all ingredients from database
    //  recipes: recipes from the users clover account
    //Renders merchantSetupPage
    merchantSetupClover: function(req, res){
        req.session.posId = "YHVPCQMVB1P81";
        
        Ingredient.find()
            .then((ingredients)=>{
                axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${req.session.posId}/items?access_token=${token}`)
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
            });
    },

    //GET - Renders the merchant setup page for a non-pos client
    //Returns:
    //  ingredients: all ingredients from database
    //  recipes: null (to signify non-post client)
    //Renders merchantSetupPage
    merchantSetupNone: function(req, res){
        Ingredient.find()
            .then((ingredients)=>{
                return res.render("merchantSetupPage/merchantSetup", {ingredients: ingredients, recipes: null});
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    //GET - Renders the recipe display page
    //Returns:
    //  merchant: merchant with recipes and recipe ingredients populated
    //Renders recipesPage
    displayRecipes: function(req, res){
        if(!req.session.user){
            return res.render("error");
        }

        Merchant.findOne({_id: req.session.user})
            .populate({
                path: "recipes",
                model: "Recipe",
                populate: {
                    path: "ingredients.ingredient",
                    model: "Ingredient"
                }
            })
            .populate("inventory.ingredient")
            .then((merchant)=>{
                return res.render("recipesPage/recipes", {merchant: merchant});
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    }
}