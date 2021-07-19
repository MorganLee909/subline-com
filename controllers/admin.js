const Merchant = require("../models/merchant.js");
const Ingredient = require("../models/ingredient.js");
const Recipe = require("../models/recipe.js");
const Order = require("../models/order.js");
const Transaction = require("../models/transaction.js");
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
            .populate("recipes")
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
                        ingredients[merchant.inventory[i].ingredient.name.toLowerCase()] = merchant.inventory[i].ingredient;
                    }
                    return ingredients;
                }
                let ingredientIndices = indexIngredients();

                //Recipes
                let newRecipes = [];
                if(req.files.recipes !== undefined){
                    let recipeData = fs.readFileSync(req.files.recipes.tempFilePath).toString();
                    fs.unlink(req.files.recipes.tempFilePath, ()=>{});
                    recipeData = recipeData.split("\n");

                    
                    merchant.recipes = [];
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
                            if(data[j] === "") break;

                            recipe.ingredients.push({
                                ingredient: ingredientIndices[data[j].toLowerCase()],
                                quantity: helper.convertQuantityToBaseUnit(parseFloat(data[j+1]), data[j+2])
                            });
                        }

                        merchant.recipes.push(recipe);
                        newRecipes.push(recipe);
                    }
                }

                let indexRecipes = ()=>{
                    let recipes = {};
                    for(let i = 0; i < merchant.recipes.length; i++){
                        recipes[merchant.recipes[i].name.toLowerCase()] = merchant.recipes[i];
                    }
                    return recipes;
                }
                let recipeIndices = indexRecipes();

                //Orders
                let newOrders = [];
                if(req.files.orders !== undefined){
                    let orderData = fs.readFileSync(req.files.orders.tempFilePath).toString();
                    fs.unlink(req.files.orders.tempFilePath, ()=>{});
                    orderData = orderData.split("\n");

                    for(let i = 0; i < orderData.length; i++){
                        if(orderData[i] === "") continue;
                        let data = orderData[i].split(",");

                        let order = new Order({
                            merchant: merchant._id,
                            name: data[0],
                            date: new Date(data[1]),
                            taxes: parseFloat(data[2]),
                            fees: parseFloat(data[3]),
                            ingredients: []
                        });

                        for(let j = 4; j < data.length; j+=3){
                            if(data[j] === "") break;
                            order.ingredients.push({
                                ingredient: ingredientIndices[data[j].toLowerCase()],
                                quantity: parseFloat(data[j+1]),
                                pricePerUnit: parseInt(parseFloat(data[j+2]) * 100)
                            });
                        }

                        newOrders.push(order);
                    }
                }

                //Transactions
                let newTransactions = [];
                if(req.files.transactions !== undefined){
                    let transactionData = fs.readFileSync(req.files.transactions.tempFilePath).toString()
                    fs.unlink(req.files.transactions.tempFilePath, ()=>{});
                    transactionData = transactionData.split("\n");

                    for(let i = 0; i < transactionData.length; i++){
                        if(transactionData[i] === "") continue;
                        let data = transactionData[i].split(",");

                        let transaction = new Transaction({
                            merchant: merchant._id,
                            date: new Date(data[0]),
                            recipes: []
                        });

                        for(let j = 1; j < data.length; j+=2){
                            if(data[j] === "") break;

                            transaction.recipes.push({
                                recipe: recipeIndices[data[j].toLowerCase()],
                                quantity: parseInt(data[j+1])
                            });
                        }

                        newTransactions.push(transaction);
                    }
                }

                return Promise.all([
                    merchant.save(),
                    Ingredient.create(newIngredients),
                    Recipe.create(newRecipes),
                    Order.create(newOrders),
                    Transaction.create(newTransactions)
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