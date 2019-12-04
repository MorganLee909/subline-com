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
                let errorMessage = "Unable to retrieve ingredients";
                let error = new Error({
                    code: 626,
                    displayMessage: errorMessage,
                    error: err
                });
                error.save();

                return res.json(errorMessage);
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
                let errorMessage = "There was an error and the ingredients could not be created";
                let error = new Error({
                    code: 547,
                    displayMessage: errorMessage,
                    error: err
                });
                error.save();

                return res.json(errorMessage);
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
                                let errorMessage = "There was an error and the data could not be saved";
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
            })
            .catch((err)=>{
                let errorMessage = "There was an error and the ingredient could not be created";
                let error = new Error({
                    code: 547,
                    displayMessage: errorMessage,
                    error: err
                });
                error.save();

                return res.json(errorMessage);
            });
    }
}