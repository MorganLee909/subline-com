const bcrypt = require("bcryptjs");
const axios = require("axios");

const Merchant = require("../models/merchant");
const Purchase = require("../models/purchase");
const Transaction = require("../models/transaction");

module.exports = {
    //POST - Creates a new purchase for a merchant
    //Inputs:
    //  req.body: list of purchases (ingredient id and quantity)
    createPurchase: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                for(let purchase of req.body){
                    let merchantIngredient = merchant.inventory.find(i => i.ingredient._id.toString() === purchase.ingredient);
                    merchantIngredient.quantity += Number(purchase.quantity);
                }
                
                merchant.save()
                    .then((merchant)=>{
                        res.json({});
                    })
                    .catch((err)=>{
                        return res.json("Error: Unable to save data");
                    });
            })
            .catch((err)=>{
                return res.json("Error: Unable to retrieve user data");
            });

            let purchase = new Purchase({
                merchant: req.session.user,
                date: Date.now(),
                ingredients: req.body
            });
            purchase.save().catch((err)=>{});
    },

    //POST - logs the user in
    //Inputs:
    //  req.body.email
    //  req.body.password
    //Redirects to "/dashboard" on success
    login: function(req, res){
        Merchant.findOne({email: req.body.email.toLowerCase()})
            .then((merchant)=>{
                if(merchant){
                    bcrypt.compare(req.body.password, merchant.password, (err, result)=>{
                        if(result){
                            req.session.user = merchant._id;
                            return res.redirect("/dashboard");
                        }else{
                            req.session.error = "Invalid email or password";
                            return res.redirect("/");
                        }
                    });
                }else{
                    req.session.error = "Invalid email or password";
                    return res.redirect("/");
                }
            })
            .catch((err)=>{
                req.session.error = "There was an error and your data could not be retrieved";

                return res.redirect("/");
            });
    },

    //GET - logs the user out
    //Redirects to "/"
    logout: function(req, res){
        req.session.user = undefined;

        return res.redirect("/");
    },

    //GET - Redirects user to Clover OAuth page
    cloverRedirect: function(req, res){
        return res.redirect(`${process.env.CLOVER_ADDRESS}/oauth/authorize?client_id=${process.env.SUBLINE_CLOVER_APPID}&redirect_uri=${process.env.SUBLINE_CLOVER_URI}`);
    },

    //GET - Get access token from clover and  redirect to merchant creation
    cloverAuth: function(req, res){
        let dataArr = req.url.slice(req.url.indexOf("?") + 1).split("&");
        let authorizationCode = "";
        let merchantId = "";

        for(let str of dataArr){
            if(str.slice(0, str.indexOf("=")) === "merchant_id"){
                merchantId = str.slice(str.indexOf("=") + 1);
            }else if(str.slice(0, str.indexOf("=")) === "code"){
                authorizationCode = str.slice(str.indexOf("=") + 1);
            }
        }

        axios.get(`${process.env.CLOVER_ADDRESS}/oauth/token?client_id=${process.env.SUBLINE_CLOVER_APPID}&client_secret=${process.env.SUBLINE_CLOVER_APPSECRET}&code=${authorizationCode}`)
            .then((response)=>{
                Merchant.findOne({posId: merchantId})
                    .then((merchant)=>{
                        if(merchant){
                            merchant.posAccessToken = response.data.access_token;

                            merchant.save()
                                .then((updatedMerchant)=>{
                                    req.session.user = updatedMerchant._id;
                                    return res.redirect("/dashboard");
                                })
                                .catch((err)=>{
                                    req.session.error("Error: unable to save critical data.  Try again.");
                                    return res.redirect("/")
                                });
                        }else{
                            req.session.merchantId = merchantId;
                            req.session.accessToken = response.data.access_token;
                            return res.redirect("/merchant/create/clover");
                        }
                    })
                    .catch((err)=>{
                        req.session.error = "Error: there was an oopsies";
                    });
                
            })
            .catch((err)=>{
                req.session.error = "Error: Unable to retrieve data from Clover";
                return res.redirect("/");
            });
    },

    //POST - Gets transactions and purchases between 2 dates for a merchant
    //Inputs:
    //  req.body.from = start date
    //  req.body.to = end date
    //Returns:
    //  transactions = list of transactions between the dates provided
    //  purchases = list of purchases between the dates provided
    getData: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        let promiseList = [];

        for(let i = 0; i < req.body.dates.length; i+=2){
            promiseList.push(new Promise((resolve, reject)=>{
                Transaction.find({merchant: req.session.user, date: {$gte: req.body.dates[i], $lt: req.body.dates[i+1]}},
                    {date: 1, recipes: 1, _id: 0},
                    {sort: {date: 1}})
                    .then((transactions)=>{
                        resolve(transactions);
                    })
                    .catch((err)=>{});
            }));

            promiseList.push(new Promise((resolve, reject)=>{
                Purchase.find({merchant: req.session.user, date: {$gte: req.body.dates[i], $lt: req.body.dates[i+1]}},
                    {date: 1, ingredients: 1, _id: 0},
                    {sort: {date: 1}})
                    .then((purchases)=>{
                        resolve(purchases);
                    })
                    .catch((err)=>{})
            }));
        }

        Promise.all(promiseList)
            .then((response)=>{
                let newList = [];

                for(let i = 0; i < response.length; i+=2){
                    newList.push({
                        transactions: response[i],
                        purchases: response[i+1]
                    });
                }

                return res.json(newList);
            })
            .catch((err)=>{
                return res.json("Error: unable to retrieve user data");
            });
    },

    resetPassword: function(req, res){
        Merchant.findOne({password: req.body.hash})
            .then((merchant)=>{
                if(merchant){
                    let salt = bcrypt.genSaltSync(10);
                    let hash = bcrypt.hashSync(req.body.pass, salt);

                    merchant.password = hash;

                    return merchant.save();
                }else{
                    req.session.error = "Error: unable to retrieve merchant data";
                    return res.redirect("/");
                }
            })
            .then((merchant)=>{
                req.session.error = "Password successfully reset.  Please log in";
                return res.redirect("/");
            })
            .catch((err)=>{});
    }
} 