const bcrypt = require("bcryptjs");
const axios = require("axios");

const NonPosTransaction = require("../models/nonPosTransaction");
const Merchant = require("../models/merchant");
const Purchase = require("../models/purchase");

module.exports = {
    //POST - Update non-pos merchant inventory and create a transaction
    //Inputs:
    //  recipesSold: list of recipes sold and how much (recipe._id and quantity)
    //Returns:
    //  merchant.inventory: entire merchant inventory after being updated
    createTransaction: function(req, res){
        if(!req.session.user){
            res.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        let transaction = new NonPosTransaction({
            date: Date.now(),
            merchant: req.session.user,
            recipes: []
        });

        for(let recipe of req.body){
            transaction.recipes.push({
                recipe: recipe.id,
                quantity: recipe.quantity
            });
        }

        //Calculate all ingredients used, store to list
        Merchant.findOne({_id: req.session.user})
            .populate("recipes")
            .then((merchant)=>{
                for(let reqRecipe of req.body){
                    let merchRecipe = merchant.recipes.find(r => r._id.toString() === reqRecipe.id);
                    for(let recipeIngredient of merchRecipe.ingredients){
                        let merchInvIngredient = merchant.inventory.find(i => i.ingredient.toString() === recipeIngredient.ingredient.toString());
                        merchInvIngredient.quantity -= recipeIngredient.quantity * reqRecipe.quantity;
                    }
                }

                merchant.save()
                    .then((merchant)=>{
                        res.json({});
                    })
                    .catch((err)=>{
                        return res.json("Error: unable to save user data");
                    });
            })
            .catch((err)=>{
                return res.json("Error: unable to retrieve user data");
            });

        transaction.save()
            .then((transaction)=>{
                return;
            })
            .catch((err)=>{});
    },

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
    //Redirects to "/inventory" on success
    login: function(req, res){
        Merchant.findOne({email: req.body.email.toLowerCase()})
            .then((merchant)=>{
                if(merchant){
                    bcrypt.compare(req.body.password, merchant.password, (err, result)=>{
                        if(result){
                            req.session.user = merchant._id;
                            return res.redirect("/inventory");
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

    clover: async function(req, res){
        if(req.url.includes("?")){
            let urlArgs = req.url.slice(req.url.indexOf("?") + 1).split("&");
            for(let str of urlArgs){
                if(str.slice(0, str.indexOf("=")) === "merchant_id"){
                    let mId = str.slice(str.indexOf("=") + 1);
                    let merchant = await Merchant.findOne({posId: mId});
                    if(merchant){
                        req.session.isLoggedIn = true;
                        return res.redirect("/");
                    }else{
                        return res.redirect("/cloverlogin");
                    }
                }
            }
        }

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

        for(let str of dataArr){
            if(str.slice(0, str.indexOf("=")) === "merchant_id"){
                req.session.merchantId = str.slice(str.indexOf("=") + 1);
            }else if(str.slice(0, str.indexOf("=")) === "code"){
                authorizationCode = str.slice(str.indexOf("=") + 1);
            }
        }
        
        axios.get(`${process.env.CLOVER_ADDRESS}/oauth/token?client_id=${process.env.SUBLINE_CLOVER_APPID}&client_secret=${process.env.SUBLINE_CLOVER_APPSECRET}&code=${authorizationCode}`)
            .then((response)=>{
                req.session.accessToken = response.data.access_token;
                return res.redirect("/merchant/create/clover");
            })
            .catch((err)=>{
                req.session.error = "Error: Unable to retrieve data from Clover";
                return res.redirect("/");
            });
    }
}