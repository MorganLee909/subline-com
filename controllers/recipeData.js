const Recipe = require("../models/recipe");
const Merchant = require("../models/merchant");

module.exports = {
    //POST - creates a single new recipe
    //Inputs:
    //  req.body.name: name of recipes
    //  req.body.price: price of the recipe
    //  req.body.ingredients: array of ingredients (object) in recipe
    //      id: id of ingredient
    //      quantity: quantity of ingredient in recipe
    //Returns newly created ingredient
    createRecipe: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        let recipe = new Recipe({
            merchant: req.session.user,
            name: req.body.name,
            price: Math.round(req.body.price * 100),
            ingredients: req.body.ingredients
        });


        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                merchant.recipes.push(recipe);
                merchant.save()
                    .catch((err)=>{
                        return res.json("Error: unable to save recipe");
                    });
            })
            .catch((err)=>{
                return res.json("Error: unable to retrieve user data");
            })

        recipe.save()
            .then((newRecipe)=>{
                return res.json(newRecipe);
            })
            .catch((err)=>{
                return res.json("Error: unable to save new ingredient");
            });
    },

    //PUT - Update a single recipe
    //Inputs:
    //  req.body: An object representing a single recipe
    //      _id: id of recipe
    //      name: name of recipe
    //      price: price of recipe
    //      ingredients: list of objects representing ingredients
    //          ingredient: id of ingredient
    //          quantity: quantity of ingredient
    updateRecipe: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Recipe.findOne({_id: req.body._id})
            .then((recipe)=>{
                recipe.name = req.body.name;
                recipe.price = req.body.price;
                
                for(let i = 0; i < req.body.ingredients.length; i++){
                    let isNew = true;
                    for(let j = 0; j < recipe.ingredients.length; j++){
                        if(req.body.ingredients[i].ingredient === recipe.ingredients[j].ingredient._id.toString()){
                            isNew = false;
                            recipe.ingredients[j].quantity = req.body.ingredients[i].quantity;
                            break;
                        }
                    }

                    if(isNew){
                        recipe.ingredients.push(req.body.ingredients[i]);
                    }
                }

                for(let i = 0; i < recipe.ingredients.length; i++){
                    let doesntExist = true;
                    for(let j = 0; j < req.body.ingredients.length; j++){
                        if(recipe.ingredients[i].ingredient._id.toString() === req.body.ingredients[j].ingredient){
                            doesntExist = false;
                            break;
                        }
                    }

                    if(doesntExist){
                        recipe.ingredients.splice(i, 1);
                    }
                }

                return recipe.save()
            })
            .then((response)=>{
                return res.json({});
            })
            .catch((err)=>{
                return res.json("Error: unable to update your recipe");
            })
    }
}