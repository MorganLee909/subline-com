const axios = require("axios");
const ObjectId = require("mongoose").Types.ObjectId;

const Merchant = require("../models/merchant");
const Transaction = require("../models/transaction");
const Order = require("../models/order");

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
    displayDashboard: function(req, res){
        if(!req.session.user){
            req.session.error = "You must be logged in to view that page";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user}, {password: 0, createdAt: 0})
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
                            _id: 0,
                            date: 1,
                            recipes: 1
                        }}
                    ])
                        .then((transactions)=>{
                            return res.render("dashboardPage/dashboard", {merchant: merchant, transactions: transactions})
                        })
                        .catch((err)=>{
                            console.log(err);
                        });
                        
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

    //GET - Renders the information page
    displayLegal: function(req, res){
        return res.render("informationPage/information");
    },

    //GET - Renders the data display page
    //Returns data
    displayData: function(req, res){
        if(!req.session.user){
            req.session.error = "You must be logged in to view that page";
            return res.redirect("/");
        }

        let date = new Date();
        let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        let lastDay = new Date();

        let merchTransPromise = new Promise((resolve, reject)=>{
            Merchant.findOne({_id: req.session.user}, 
                {name: 1, inventory: 1, recipes: 1, _id: 0})
                .populate("recipes")
                .populate("inventory.ingredient")
                .then((merchant)=>{
                    Transaction.find({merchant: req.session.user, date: {$gte: firstDay, $lt: lastDay}},
                        {date: 1, recipes: 1, _id: 0},
                        {sort: {date: 1}})
                        .then((transactions)=>{
                            resolve({merchant: merchant, transactions: transactions});
                        })
                        .catch((err)=>{});
                })
                .catch((err)=>{});
        });

        let orderPromise = new Promise((resolve, reject)=>{
            Order.find({merchant: req.session.user, date: {$gte: firstDay, $lt: lastDay}},
                {date: 1, ingredients: 1, _id: 0},
                {sort: {date: 1}})
                .then((orders)=>{
                    resolve(orders);
                })
                .catch((err)=>{});
        });

        Promise.all([merchTransPromise, orderPromise])
            .then((response)=>{
                let data = {
                    merchant: response[0].merchant,
                    transactions: response[0].transactions,
                    orders: response[1],
                    dates: [firstDay, lastDay]
                }

                return res.render("dataPage/data", {data: data});
            })
            .catch((err)=>{
                req.session.error = "Error: unable to retrieve user data";

                return res.redirect("/");
            });
    },

    displayPassReset: function(req, res){
        return res.render("passResetPage/passReset");
    }
}