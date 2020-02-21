const axios = require("axios");

const Merchant = require("../models/merchant");
const Ingredient = require("../models/ingredient");
const Transaction = require("../models/transaction");
const Purchase = require("../models/purchase");
const NonPosTransaction = require("../models/nonPosTransaction");

module.exports = {
    //GET - Shows the public landing page
    //Returns: 
    //  Error: a single error message (only if there is an error)
    //Renders landingPage
    landingPage: function(req, res){
        let error = {};
        let isLoggedIn = req.session.isLoggedIn || false;
        if(req.session.error){
            error = req.session.error;
            req.session.error = undefined;
        }else{
            error = null;
        }

        return res.render("landingPage/landing", {error: error, isLoggedIn: isLoggedIn});
    },

    //GET - Displays the main inventory page for merchants
    //Returns:
    //  merchant: the logged in merchant
    //Renders inventoryPage
    displayInventory: function(req, res){
        if(!req.session.user){
            req.session.error = "You must be logged in to view that page";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .populate("inventory.ingredient")
            .populate({
                path: "recipes",
                model: "Recipe",
                populate: {
                    path: "ingredients.ingredient",
                    model: "Ingredient"
                }
            })
            .then((merchant)=>{
                if(merchant.pos === "clover"){
                    axios.get(`${process.env.CLOVER_ADDRESS}/v3/merchants/${merchant.posId}/orders?filter=clientCreatedTime>=${merchant.lastUpdatedTime}&expand=lineItems&access_token=${merchant.posAccessToken}`)
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
                                        //Search and increment/add instead of just push
                                        // newTransaction.recipes.push(recipe._id);
                                        let isNewRecipe = true;
                                        for(let newRecipe of newTransaction.recipes){
                                            if(newRecipe.recipe === recipe._id){
                                                newRecipe.quantity++;
                                                isNewRecipe = false;
                                                break;
                                            }
                                        }

                                        if(isNewRecipe){
                                            newTransaction.recipes.push({
                                                recipe: recipe._id,
                                                quantity: 1
                                            });
                                        }

                                        //End modifications
                                        for(let ingredient of recipe.ingredients){
                                            let inventoryIngredient = {};
                                            for(let invItem of merchant.inventory){
                                                if(invItem.ingredient._id.toString() === ingredient.ingredient._id.toString()){
                                                    inventoryIngredient = invItem;
                                                }
                                            }
                                            inventoryIngredient.quantity = (inventoryIngredient.quantity - ingredient.quantity).toFixed(2);
                                        }
                                    }
                                }

                                transactions.push(newTransaction);
                            }
                            merchant.lastUpdatedTime = Date.now();

                            merchant.save()
                                .then((updatedMerchant)=>{
                                    updatedMerchant.password = undefined;
                                    updatedMerchant.accessToken = undefined;
                                    res.render("inventoryPage/inventory", {merchant: updatedMerchant, error: undefined});
                                    Transaction.create(transactions);
                                    return;
                                })
                                .catch((err)=>{
                                    let errorMessage = "Error: unable to save user data";
                                    
                                    merchant.password = undefined;
                                    return res.render("inventoryPage/inventory", {merchant: updatedMerchant, error: errorMessage});
                                });
                        })
                        .catch((err)=>{
                            let errorMessage = "There was an error and we could not retrieve your transactions from Clover";

                            merchant.password = undefined;
                            return res.render("inventoryPage/inventory", {merchant: merchant, error: errorMessage});
                        });
                }else if(merchant.pos === "none"){
                    merchant.password = undefined;
                    return res.render("inventoryPage/inventory", {merchant: merchant, error: undefined});
                }else{
                    req.session.error = "Error: WEBSITE PANIC";
                    
                    return res.redirect("/");
                }
            })
            .catch((err)=>{
                req.session.error = "Error: could not retrieve user data";
                
                return res.redirect("/");
            });
    },

    //GET - Renders the merchant setup page for a clover client
    //Returns:
    //  ingredients: all ingredients from database
    //  recipes: recipes from the users clover account
    //  error: returns error (if any) from session
    //Renders merchantSetupPage
    merchantSetupClover: function(req, res){
        let errorMessage = {};
        if(req.session.error){
            errorMessage = req.session.error;
            req.session.error = undefined;
        }else{
            errorMessage = null;
        }
        
        Ingredient.find()
            .then((ingredients)=>{
                axios.get(`${process.env.CLOVER_ADDRESS}/v3/merchants/${req.session.merchantId}/items?access_token=${req.session.accessToken}`)
                    .then((recipes)=>{
                        return res.render("merchantSetupPage/merchantSetup", {ingredients: ingredients, recipes: recipes.data, error: errorMessage});
                    })
                    .catch((err)=>{
                        req.session.error = "Error: unable to retrieve data from Clover";
                        
                        return res.redirect("/");
                    });
            })
            .catch((err)=>{
                req.session.error = "Error: data for new merchants could not be retrieved";
                
                return res.redirect("/");
            });
    },

    //GET - Renders the merchant setup page for a non-pos client
    //Returns:
    //  ingredients: all ingredients from database
    //  recipes: null (to signify non-post client)
    //  error: returns error (if any) from session
    //Renders merchantSetupPage
    merchantSetupNone: function(req, res){
        let errorMessage = {};
        if(req.session.error){
            errorMessage = req.session.error;
            req.session.error = undefined;
        }else{
            errorMessage = null;
        }

        Ingredient.find()
            .then((ingredients)=>{
                return res.render("merchantSetupPage/merchantSetup", {ingredients: ingredients, recipes: null, error: errorMessage});
            })
            .catch((err)=>{
                req.session.error = "Error: data for new merchants could not be retrieved";

                return res.redirect("/");
            });
    },

    //GET - Renders the recipe display page
    //Returns:
    //  merchant: merchant with recipes and recipe ingredients populated
    //Renders recipesPage
    displayRecipes: function(req, res){
        if(!req.session.user){
            req.session.error = "You must be logged in to view that page";
            return res.redirect("/");
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
                merchant.password = undefined;
                return res.render("recipesPage/recipes", {merchant: merchant});
            })
            .catch((err)=>{
                req.session.error = "Error: unable to retrieve user data";
            
                return res.redirect("/");
            });
    },

    //GET - Renders the information page
    //Renders information page
    displayLegal: function(req, res){
        return res.render("informationPage/information");
    },

    displayData: function(req, res){
        if(!req.session.user){
            req.session.error = "You must be logged in to view that page";
            return res.redirect("/");
        }

        let merchTransPromise = new Promise((resolve, reject)=>{
            Merchant.findOne({_id: req.session.user})
                .populate("recipes")
                .populate("inventory.ingredient")
                .then((merchant)=>{
                    let date = new Date();
                    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                    let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

                    if(merchant.pos === "clover"){
                        Transaction.find({merchant: req.session.user, date: {$gte: firstDay, $lt: lastDay}})
                            .then((transactions)=>{
                                resolve({merchant: merchant, transactions: transactions});
                            })
                            .catch((err)=>{});
                    }else{
                        NonPosTransaction.find({merchant: req.session.user, date: {$gte: firstDay, $lt: lastDay}})
                        
                            .then((transactions)=>{
                                resolve({merchant: merchant, transactions: transactions});
                            })
                            .catch((err)=>{});
                    }
                })
                .catch((err)=>{});
        });

        let purchasePromise = new Promise((resolve, reject)=>{
            Purchase.find({merchant: req.session.user})
                .then((purchases)=>{
                    resolve(purchases);
                })
                .catch((err)=>{});
        });

        Promise.all([merchTransPromise, purchasePromise])
            .then((response)=>{
                let data = {
                    merchant: response[0].merchant,
                    transactions: response[0].transactions,
                    purchases: response[1]
                }

                return res.render("dataPage/data", {data: data});
            })
            .catch((err)=>{
                req.session.error = "Error: unable to retrieve user data";

                return res.redirect("/");
            });
    }
}