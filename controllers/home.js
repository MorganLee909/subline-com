const axios = require("axios");
const bcrypt = require("bcryptjs");

const Merchant = require("../models/merchant");
const nonPosTransaction = require("../models/nonPosTransaction");

const token = "b48068eb-411a-918e-ea64-52007147e42c";

module.exports = {
    createTransaction: function(req, res){
        let transaction = new nonPosTransaction({
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
                        res.json(merchant.inventory);
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

        transaction.save()
            .then((transaction)=>{
                return;
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    getCloverRecipes: function(req, res){
        if(!req.session.user){
            return res.render("error");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchant.posId}/items?access_token=${token}`)
                    .then((recipes)=>{
                        return res.json(recipes);
                    })
                    .catch((err)=>{
                        return res.json(err);
                    });
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    unregistered: function(req, res){
        return res.redirect("/");
    },

    login: function(req, res){
        Merchant.findOne({email: req.body.email.toLowerCase()})
            .then((merchant)=>{
                if(merchant){
                    bcrypt.compare(req.body.password, merchant.password, (err, result)=>{
                        if(result){
                            req.session.user = merchant._id;
                            return res.redirect("/inventory");
                        }
                    });
                }else{
                    req.session.error = {
                        type: "login",
                        message: "Invalid email or password"
                    }

                    return res.redirect("/");
                }
            })
            .catch((err)=>{
                console.log(err);
                return res.redirect("/");
            });
    },

    logout: function(req, res){
        req.session.user = undefined;

        return res.redirect("/");
    }
}