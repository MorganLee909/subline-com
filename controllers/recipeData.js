const Recipe = require("../models/recipe");
const Merchant = require("../models/merchant");

module.exports = {
    //POST - creates a single new recipe
    //Inputs:
    //  req.body.name: name of recipes
    //Returns the newly created recipe
    createRecipe: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        let recipe = new Recipe({
            merchant: req.session.user,
            name: req.body.name,
            ingredients: []
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
    }
}