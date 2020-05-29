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
                return res.json("Error: unable to retrieve ingredients");
            });
    },

    /*
    POST - create a single ingredient and then add to the merchant
    req.body = {
        ingredient: {
            name: name of ingredient,
            category: category of ingredient,
            unit: unit measurement of ingredient
        },
        quantity: quantity of ingredient for current merchant
    }
    Returns:
        Same as above, with the _id
    */
    createIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        let ingredientPromise = Ingredient.create((req.body.ingredient));
        let merchantPromise = Merchant.findOne({_id: req.session.user});
        let newIngredient;

        Promise.all([ingredientPromise, merchantPromise])
            .then((response)=>{
                newIngredient = {
                    ingredient: response[0],
                    quantity: req.body.quantity
                }

                response[1].inventory.push(newIngredient);

                return response[1].save();
            })
            .then((response)=>{
                return res.json(newIngredient);
            })
            .catch((err)=>{
                return res.json("Error: unable to create new ingredient");
            });
    }
}