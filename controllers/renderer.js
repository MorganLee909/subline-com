const axios = require("axios");
const ObjectId = require("mongoose").Types.ObjectId;

const Merchant = require("../models/merchant");
const Transaction = require("../models/transaction");

module.exports = {
    /*
    GET - Shows the public landing page
    Return = a single error message (only if there is an error)
    Renders landingPage
    */
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

    /*
    GET - Displays the main inventory page for merchants
    Returns = the logged in merchant and his/her data
    Renders inventoryPage
    */
    displayDashboard: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user}, {password: 0, createdAt: 0})
            .populate("inventory.ingredient")
            .populate("recipes")
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
                                merchant.lastUpdatedTime = Date.now();
                            }

                            merchant.save()
                                .then((updatedMerchant)=>{
                                    updatedMerchant.accessToken = undefined;
                                    merchant = updatedMerchant;
                                    
                                    Transaction.create(transactions);

                                    let date = new Date();
                                    let firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);

                                    return Transaction.aggregate([
                                        {$match: {
                                            merchant: new ObjectId(req.session.user),
                                            date: {$gte: firstDay}
                                        }},
                                        {$sort: {date: 1}},
                                        {$project: {
                                            date: 1,
                                            recipes: 1
                                        }}
                                    ])
                                })
                                .then((transactions)=>{
                                    res.render("dashboardPage/dashboard", {merchant: merchant, transactions: transactions});
                                })
                                .catch((err)=>{
                                    let errorMessage = "Error: unable to update data";
                                    
                                    merchant.password = undefined;
                                    return res.render("dashboardPage/dashboard", {merchant: merchant, error: errorMessage, transactions: []});
                                });
                        })
                        .catch((err)=>{
                            let errorMessage = "There was an error and we could not retrieve your transactions from Clover";

                            merchant.password = undefined;
                            return res.render("dashboardPage/dashboard", {merchant: merchant, error: errorMessage, transactions: []});
                        });
                }else if(merchant.pos === "none"){
                    merchant.password = undefined;

                    let date = new Date();
                    let firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);

                    Transaction.aggregate([
                        {$match: {
                            merchant: new ObjectId(req.session.user),
                            date: {$gte: firstDay},
                        }},
                        {$sort: {date: 1}},
                        {$project: {
                            date: 1,
                            recipes: 1
                        }}
                    ])
                        .then((transactions)=>{
                            return res.render("dashboardPage/dashboard", {merchant: merchant, transactions: transactions})
                        })
                        .catch((err)=>{});
                        
                }else{
                    req.session.error = "ERROR: WEBSITE PANIC!";
                    
                    return res.redirect("/");
                }
            })
            .catch((err)=>{
                req.session.error = "ERROR: COULD NOT RETRIEVE USER DATA";
                
                return res.redirect("/");
            });
    },

    //GET - Renders the information page
    displayLegal: function(req, res){
        return res.render("informationPage/information");
    },

    //GET - Renders the page to reset your password
    displayPassReset: function(req, res){
        return res.render("passResetPage/passReset");
    }
}