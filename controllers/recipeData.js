const Recipe = require("../models/recipe.js");

const helper = require("./helper.js");

const xlsx = require("xlsx");
const fs = require("fs");

module.exports = {
    /*
    POST - creates a single new recipe
    req.body = {
        name: name of recipe,
        price: price of the recipe,
        category: String
        ingredients: [{
            id: id of ingredient,
            quantity: quantity of ingredient in recipe,
            unit: String
        }]
    }
    Return = newly created recipe in same form as above, with _id
    */
    createRecipe: function(req, res){
        let recipe = new Recipe({
            merchant: res.locals.merchant._id,
            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            ingredients: req.body.ingredients
        });

        recipe.save()
            .then((newRecipe)=>{
                res.locals.merchant.recipes.push(recipe);
                res.locals.merchant.save().catch((err)=>{throw err});

                return res.json(newRecipe);
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO SAVE INGREDIENT");
            });
    },

    /*
    PUT - Update a single recipe
    req.body = {
        id: id of recipe,
        name: name of recipe,
        price: price of recipe,
        category: String
        ingredients: [{
            ingredient: id of ingredient,
            quantity: quantity of ingredient in recipe
            unit: String
        }]
    }
    */
    updateRecipe: function(req, res){
        Recipe.findOne({_id: req.body.id})
            .then((recipe)=>{

                if(res.locals.merchant.pos === "none"){
                    recipe.name = req.body.name;
                    recipe.price = req.body.price;
                    recipe.category = req.body.category;
                }
                recipe.ingredients = req.body.ingredients;

                return recipe.save();
            })
            .then((recipe)=>{
                res.json(recipe);
            })
            .catch((err)=>{
                if(typeof(err) === "string") return res.json(err);
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO UPDATE DATA");
            });
    },
    /*
    DELETE: removes a single recipe from the merchant and the database
    req.params.id = String (recipe id)
    response = {}
    */
    removeRecipe: function(req, res){
        if(res.locals.merchant.pos === "square") return res.json("YOU MUST EDIT YOUR RECIPES INSIDE SQUARE");
        
        for(let i = 0; i < res.locals.merchant.recipes.length; i++){
            if(res.locals.merchant.recipes[i].toString() === req.params.id){
                res.locals.merchant.recipes.splice(i, 1);
                break;
            }
        }
        res.locals.merchant.save()
            .then(()=>{
                return res.json({});
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO DELETE RECIPE");
            });
    },

    /*
    GET: toggles the hidden property of a recipe
    req.params.id = String (id of recipe)
    response = {}
    */
    hideRecipe: function(req, res){
        Recipe.findOne({_id: req.params.id})
            .then((recipe)=>{
                if(recipe.merchant.toString() !== res.locals.merchant._id.toString()) throw "unauthorized";
                recipe.hidden = (recipe.hidden === true) ? false : true;
                return recipe.save();
            })
            .then((recipe)=>{
                return res.json({});
            })
            .catch((err)=>{
                if(err === "unauthorized") return res.json("YOU DO NOT HAVE PERMISSION TO EDIT THAT RECIPE");
                return res.json("ERROR: UNABLE TO HIDE/UNHIDE THE RECIPE");
            });
    },

    /*
    POST: gets a list of individual recipes
    req.body = [String] (ids)
    response = [Recipe]
    */
    findRecipes: function(req, res){
        Recipe.find(req.body)
            .then((recipes)=>{
                return res.json(recipes);
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO FIND DELETED RECIPES TO MATCH WITH TRANSACTIONS");
            });
    }
}