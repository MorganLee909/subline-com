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
    //Returns the newly created recipe
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
                return res.json({});
            })
            .catch((err)=>{
                console.log(err);
                return res.json("Error: unable to save new ingredient");
            });
    }
}