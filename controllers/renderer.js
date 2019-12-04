const axios = require("axios");

const Error = require("../models/error");
const Merchant = require("../models/merchant");
const Ingredient = require("../models/ingredient");
const Transaction = require("../models/transaction");

const token = "b48068eb-411a-918e-ea64-52007147e42c";

module.exports = {
    //GET - Shows the public landing page
    //Returns: 
    //  Error: a single error message (only if there is an error)
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
            req.session.error = "You must logged in to view that page";
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
                                    merchant.password = undefined;
                                    res.render("inventoryPage/inventory", {merchant: updatedMerchant, error: undefined});
                                    Transaction.create(transactions);
                                    return;
                                })
                                .catch((err)=>{
                                    let errorMessage = "There was an error and your transactions could not be updated";
                                    let error = new Error({
                                        code: 547,
                                        displayMessage: errorMessage,
                                        error: err
                                    });
                                    error.save()

                                    merchant.password = undefined;
                                    return res.render("inventoryPage/inventory", {merchant: updatedMerchant, error: errorMessage});
                                });
                        })
                        .catch((err)=>{
                            let errorMessage = "There was an error and we could not retrieve your transactions from Clover";
                            let error = new Error({
                                code: 111,
                                displayMessage: errorMessage,
                                error: err
                            });
                            error.save()

                            merchant.password = undefined;
                            return res.render("inventoryPage/inventory", {merchant: merchant, error: errorMessage});
                        });
                }else if(merchant.pos === "none"){
                    merchant.password = undefined;
                    return res.render("inventoryPage/inventory", {merchant: merchant, error: undefined})
                }else{
                    req.session.error = "There was an error and your data could not be retrieved";
                    let error = new Error({
                        code: 626,
                        displayMessage: req.session.error,
                        error: "merchant.pos did not conform to expectations"
                    });
                    error.save();

                    return res.redirect("/");
                }
            })
            .catch((err)=>{
                req.session.error = "There was an error and your data could not be retrieved";
                let error = new Error({
                    code: 626,
                    displayMessage: req.session.error,
                    error: err
                });
                error.save();

                return res.redirect("/");
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
                        req.session.error = "We were unable to retrieve your data from Clover"
                        let error = new Error({
                            code: 111,
                            displayMessage: req.session.error,
                            error: err
                        });
                        error.save();

                        return res.redirect("/");
                    });
            })
            .catch((err)=>{
                req.session.error = "Data for new merchants could not be retrieved";
                let error = new Error({
                    code: 626,
                    displayMessage: req.session.error,
                    error: err
                });
                error.save();

                return res.redirect("/");
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
                req.session.error = "Data for new merchants could not be retrieved";
                let error = new Error({
                    code: 626,
                    displayMessage: req.session.error,
                    error: err
                });
                error.save();
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
                req.session.error = "There was an error and your data could not be retrieved";
                let error = new Error({
                    code: 626,
                    displayMessage: req.session.error,
                    error: err
                });
                error.save();

                return res.redirect("/");
            });
    }
}