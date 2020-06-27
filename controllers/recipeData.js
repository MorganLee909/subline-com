const Recipe = require("../models/recipe");
const Merchant = require("../models/merchant");
const Validator = require("./validator.js");

module.exports = {
    /*
    POST - creates a single new recipe
    req.body = {
        name: name of recipe,
        price: price of the recipe,
        ingredients: [{
            id: id of ingredient,
            quantity: quantity of ingredient in recipe
        }]
    }
    Return = newly created recipe in same form as above, with _id
    */
    createRecipe: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let validation = Validator.recipe(req.body);
        if(validation !== true){
            return res.json(validation);
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
                        return res.json("ERROR: UNABLE TO SAVE RECIPE");
                    });
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE USER DATA");
            });

        recipe.save()
            .then((newRecipe)=>{
                return res.json(newRecipe);
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO SAVE INGREDIENT");
            });
    },

    /*
    PUT - Update a single recipe
    req.body = {
        id: id of recipe,
        name: name of recipe,
        price: price of recipe,
        ingredients: [{
            ingredient: id of ingredient,
            quantity: quantity of ingredient in recipe
        }]
    }
    */
    updateRecipe: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let validation = Validator.recipe(req.body);
        if(validation !== true){
            return res.json(validation);
        }

        Recipe.findOne({_id: req.body.id})
            .then((recipe)=>{
                recipe.name = req.body.name;
                recipe.price = req.body.price;
                recipe.ingredients = req.body.ingredients;

                return recipe.save()
            })
            .then((response)=>{
                return res.json({});
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO UPDATE RECIPE");
            });
    }
}