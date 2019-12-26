const bcrypt = require("bcryptjs");

const Error = require("../models/error");
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
            author: "None",
            merchant: req.session.user,
            recipes: req.body
        });

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
                        let errorMessage = "There was an error and your transactions could not be saved";
                        let error = new Error({
                            code: 547,
                            displayMessage: errorMessage,
                            error: err
                        });
                        error.save();

                        return res.json(errorMessage);
                    });
            })
            .catch((err)=>{
                let errorMessage = "There was an error and your data could not be retrieved";
                let error = new Error({
                    code: 626,
                    displayMessage: errorMessage,
                    error: err
                });
                error.save();

                return res.json(errorMessage);
            });

        transaction.save()
            .then((transaction)=>{
                return;
            })
            .catch((err)=>{
                let error = new Error({
                    code: 120,
                    displayMessage: "none",
                    error: err
                });
                error.save();
            });
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
                        let errorMessage = "Error: Unable to save data";
                        let error = new Error({
                            code: 547,
                            displayMessage: errorMessage,
                            error: err
                        });
                        error.save();

                        return res.json(errorMessage);
                    });
            })
            .catch((err)=>{
                let errorMessage = "Error: Unable to retrieve user data";
                let error = new Error({
                    code: 626,
                    displayMessage: errorMessage,
                    error: err
                });
                error.save();

                return res.json(errorMessage);
            });

            let purchase = new Purchase({
                merchant: req.session.user,
                date: Date.now(),
                ingredients: req.body
            });

            purchase.save()
                .catch((err)=>{
                    let error = new Error({
                        code: 120,
                        displayMessage: "none",
                        error: err
                    });
                    error.save();
                });
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
                let error = new Error({
                    code: 626,
                    displayMessage: req.session.error,
                    error: err
                });
                error.save();

                return res.redirect("/");
            });
    },

    //GET - logs the user out
    //Redirects to "/"
    logout: function(req, res){
        req.session.user = undefined;

        return res.redirect("/");
    },

    //POST - check an email for uniqueness
    //
    checkUniqueEmail: function(req, res){
        Merchant.findOne({email: req.body.email})
            .then((merchant)=>{
                if(merchant){
                    return res.json(false);
                }else{
                    return res.json(true);
                }
            })
            .catch((err)=>{
                let errorMessage = "Error: unable to validate email address";
                let error = new Error({
                    code: 626,
                    displayMessage: errorMessage,
                    error: err
                });
                error.save();

                return res.json(errorMessage);
            });
    }
}