const Merchant = require("../models/merchant.js");
const Ingredient = require("../models/ingredient.js");
const Recipe = require("../models/recipe.js");
const helper = require("./helper.js");

const fs = require("fs");

module.exports = {
    /*
    POST: Adding data for admins
    req.body = {
        password: String
        id: String <merchant id>
    }
    req.files = {
        ingredients: txt
        recipes: txt 
    }
    */
    addData: function(req, res){
        if(req.body.password !== process.env.ADMIN_PASS) return res.json("bad password");

        Merchant.findOne({_id: req.body.id})
            .populate("inventory.ingredient")
            .then((merchant)=>{
                //Ingredients
                let newIngredients = [];
                if(req.files.ingredients !== undefined){
                    let ingredientData = fs.readFileSync(req.files.ingredients.tempFilePath).toString();
                    fs.unlink(req.files.ingredients.tempFilePath, ()=>{});
                    ingredientData = ingredientData.split("\n");

                    merchant.inventory = [];
                    for(let i = 0; i < ingredientData.length; i++){
                        if(ingredientData[i] === "") continue;
                        let data = ingredientData[i].split(",");
                        let ingredient = new Ingredient({
                            name: data[0],
                            category: data[1],
                            unitType: helper.getUnitType(data[3]),
                            ingredients: []
                        });

                        let merchIngredient = {
                            ingredient: ingredient._id,
                            quantity: helper.convertQuantityToBaseUnit(data[2], data[3]),
                            defaultUnit: data[3]
                        };
                        
                        if(data[3].toLowerCase() === "bottle"){
                            ingredient.unitType = data[5];
                            ingredient.unitSize = helper.convertQuantityToBaseUnit(data[4], data[5])
                            merchIngredient.defaultUnit = "bottle";
                        }

                        newIngredients.push(ingredient);
                        merchant.inventory.push(merchIngredient);
                    }
                }

                let indexIngredients = ()=>{
                    let ingredients = {};
                    for(let i = 0; i < merchant.inventory.length; i++){
                        ingredients[merchant.inventory[i].ingredient.name] = merchant.inventory[i].ingredient;
                    }
                    return ingredients;
                }

                //Recipes
                let newRecipes = [];
                if(req.files.recipes !== undefined){
                    let recipeData = fs.readFileSync(req.files.recipes.tempFilePath).toString();
                    fs.unlink(req.files.recipes.tempFilePath, ()=>{});
                    recipeData = recipeData.split("\n");

                    let ingredientIndices = indexIngredients();
                    for(let i = 0; i < recipeData.length; i++){
                        if(recipeData[i] === "") continue;
                        let data = recipeData[i].split(",");
                        let recipe = new Recipe({
                            merchant: merchant._id,
                            name: data[0],
                            price: parseInt(parseFloat(data[1]) * 100),
                            category: data[2],
                            ingredients: []
                        });

                        for(let j = 3; j < data.length; j+=3){
                            recipe.ingredients.push({
                                ingredient: ingredientIndices[data[j]],
                                quantity: helper.convertQuantityToBaseUnit(parseFloat(data[j+1]), data[j+2])
                            });
                        }

                        merchant.recipes.push(recipe);
                        newRecipes.push(recipe);
                    }
                }

                return Promise.all([
                    merchant.save(),
                    Ingredient.create(newIngredients),
                    Recipe.create(newRecipes)
                ]);
            })
            .then((response)=>{
                return res.redirect("/dashboard");
            })
            .catch((err)=>{
                console.log(err);
                return res.json("ERROR: A whoopsie has been made");
            });
    }
}