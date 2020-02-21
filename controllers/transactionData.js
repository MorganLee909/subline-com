const Transaction = require("../models/transaction");
const Purchase = require("../models/purchase");
const Merchant = require("../models/merchant");

module.exports = {
    getTransactions: function(req, res){
        if(!req.session.user){
            req.session.error = "You must be logged in to view that page";
            return res.redirect("/");
        }

        let date = new Date();
        let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        Transaction.find({merchant: req.session.user, date: {$gte: firstDay, $lt: lastDay}})
            .then((transactions)=>{
                return res.json(transactions);
            })
            .catch((err)=>{
                return res.json("Error: could not retrieve sales data");
            });
    },

    getPurchases: function(req, res){
        if(!req.session.user){
            req.session.error = "You must be logged in to view that page";
            return res.redirect("/");
        }

        Purchase.find({merchant: req.session.user})
            .then((purchases)=>{
                return res.json(purchases);
            })
            .catch((err)=>{
                return res.json("Error: could not retrieve purchases data");
            })
    },

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

        let transaction = new Transaction({
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
}