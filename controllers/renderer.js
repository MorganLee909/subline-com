const axios = require("axios");
const ObjectId = require("mongoose").Types.ObjectId;

const Merchant = require("../models/merchant.js");
const Transaction = require("../models/transaction.js");
const Activity = require("../models/activity.js");

const helper = require("./helper.js");

module.exports = {
    /*
    GET - Shows the public landing page
    Return = a single error message (only if there is an error)
    Renders landingPage
    */
    landingPage: function(req, res){
        new Activity({
            ipAddr: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            merchant: req.session.user,
            route: "landing",
            date: new Date()
        })
            .save()
            .catch(()=>{});

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
        let activity = new Activity({
            ipAddr: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            merchant: req.session.user,
            route: "dashboard",
            date: new Date()
        })
            .save()
            .catch(()=>{});

        Merchant.findOne(
            {_id: req.session.user},
            {
                name: 1,
                pos: 1,
                posId: 1,
                posAccessToken: 1,
                lastUpdatedTime: 1,
                inventory: 1,
                recipes: 1,
                squareLocation: 1
            }
        )
            .populate("inventory.ingredient")
            .populate("recipes")
            .then(async (merchant)=>{
                let promiseArray = [];
                if(merchant.pos === "clover"){
                    const subscriptionCheck = axios.get(`${process.env.CLOVER_ADDRESS}/v3/apps/${process.env.SUBLINE_CLOVER_APPID}/merchants/${merchant.posId}/billing_info?access_token=${merchant.posAccessToken}`);
                    const transactionRetrieval = axios.get(`${process.env.CLOVER_ADDRESS}/v3/merchants/${merchant.posId}/orders?filter=modifiedTime>=${merchant.lastUpdatedTime}&expand=lineItems&expand=payment&access_token=${merchant.posAccessToken}`);
                    await Promise.all([subscriptionCheck, transactionRetrieval])
                        .then(async (response)=>{
                            if(response[0].data.status !== "ACTIVE"){
                                req.session.error = "SUBSCRIPTION EXPIRED.  PLEASE RENEW ON CLOVER";
                                return res.redirect("/");
                            }

                            const updatedTime = Date.now();
                            
                            //Create Subline transactions from Clover Transactions
                            let transactions = [];
                            for(let i = 0; i < response[1].data.elements.length; i++){
                                let order = response[1].data.elements[i];
                                if(order.paymentState !== "PAID"){
                                    break;
                                }
                                let newTransaction = new Transaction({
                                    merchant: merchant._id,
                                    date: new Date(order.createdTime),
                                    device: order.device.id,
                                    posId: order.id
                                });

                                //Go through lineItems from Clover
                                //Get the appropriate recipe from Subline
                                //Add it to the transaction or increment if existing
                                for(let j = 0; j < order.lineItems.elements.length; j++){
                                    let recipe = {}
                                    for(let k = 0; k < merchant.recipes.length; k++){
                                        if(merchant.recipes[k].posId === order.lineItems.elements[j].item.id){
                                            recipe = merchant.recipes[k];
                                            break;
                                        }
                                    }

                                    if(recipe){
                                        let isNewRecipe = true;
                                        for(let k = 0; k < newTransaction.recipes.length; k++){
                                            if(newTransaction.recipes[k].recipe === recipe._id){
                                                newTransaction.recipes[k].quantity++;
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

                                        //Subtract ingredients from merchants total for each ingredient in a recipe
                                        for(let k = 0; k < recipe.ingredients.length; k++){
                                            let inventoryIngredient = {};
                                            for(let l = 0; l < merchant.inventory.length; l++){
                                                if(merchant.inventory[l].ingredient._id.toString() === recipe.ingredients[k].ingredient._id.toString()){
                                                    inventoryIngredient = merchant.inventory[l];
                                                    break;
                                                }
                                            }
                                            inventoryIngredient.quantity = inventoryIngredient.quantity - ingredient.quantity;
                                        }
                                    }
                                }

                                transactions.push(newTransaction);
                            }

                            merchant.lastUpdatedTime = updatedTime;

                            //Remove any existing orders so that they can ber replaced
                            let ids = [];
                            for(let i = 0; i < transactions.length; i++){
                                ids.push(transactions[i].posId);
                            }
                            Transaction.deleteMany({posId: {$in: ids}});

                            promiseArray.push(Transaction.create(transactions));
                        })
                        .catch((err)=>{
                            req.session.error = "ERROR: UNABLE TO RETRIEVE DATA FROM CLOVER";
                            return res.redirect("/");
                        });
                }else if(merchant.pos === "square"){
                    promiseArray = helper.getSquareData(merchant);
                }

                return Promise.all([merchant.save()].concat(promiseArray));
            })
            .then((response)=>{
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
                        response[0]._id = undefined;
                        response[0].posAccessToken = undefined;
                        response[0].lastUpdatedTime = undefined;
                        response[0].accountStatus = undefined;

                        return res.render("dashboardPage/dashboard", {merchant: response[0], transactions: transactions});
                    })
                    .catch((err)=>{});
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO RETRIEVE USER DATA";
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