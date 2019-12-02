const bcrypt = require("bcryptjs");

const NonPosTransaction = require("../models/nonPosTransaction");
const Merchant = require("../models/merchant");

module.exports = {
    //POST - Update non-pos merchant inventory and create a transaction
    //Inputs:
    //  recipesSold: list of recipes sold and how much (recipe._id and quantity)
    //Returns:
    //  merchant.inventory: entire merchant inventory after being updated
    createTransaction: function(req, res){
        if(!req.session.user){
            return res.render("error");
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

    //GET - logs the user out
    //Redirects to "/"
    logout: function(req, res){
        req.session.user = undefined;

        return res.redirect("/");
    }
}