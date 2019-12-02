const Merchant = require("../models/merchant");
const Ingredient = require("../models/ingredient");

module.exports = {
    //GET - gets a list of all database ingredients
    //Returns:
    //  ingredients: list containing all ingredients
    getIngredients: function(req, res){
        Ingredient.find()
            .then((ingredients)=>{
                return res.json(ingredients);
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    //POST - creates new ingredients from a list
    //Inputs:
    //  req.body: list of ingredients (name, category, unit)
    //Returns:
    //  ingredients: list containing the newly created ingredients
    createNewIngredients: function(req, res){
        if(!req.session.user){
            return res.render("error");
        }

        Ingredient.create(req.body)
            .then((ingredients)=>{
                return res.json(ingredients);
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    //TODO - Redirect to merchantData.js rather than adding here
    //POST - create a single ingredient and then add to the merchant
    //Inputs: 
    //  req.body.ingredient: full ingredient to create (name, category, unit)
    //  req.body.quantity: quantity of ingredient for merchant
    //Returns:
    //  item: ingredient and quantity
    createIngredient: function(req, res){
        if(!req.session.user){
            return res.render("error");
        }
        
        Ingredient.create(req.body.ingredient)
            .then((ingredient)=>{
                Merchant.findOne({_id: req.session.user})
                    .then((merchant)=>{
                        let item = {
                            ingredient: ingredient,
                            quantity: req.body.quantity
                        }
                        merchant.inventory.push(item);
                        merchant.save()
                            .then((merchant)=>{
                                return res.json(item);
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
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });  
    }
}