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
    req.files = {
        ingredients: txt
        recipes: txt
        orders: txt
        transactions: txt
    }
    */
    addData: function(req, res){
        if(req.body.password !== process.env.ADMIN_PASS) return res.json("bad password");

        Merchant.findOne({_id: req.session.merchant})
            .populate("inventory.ingredient")
            .populate("recipes")
            .then((merchant)=>{
                // console.log(merchant);
                //Ingredients
                let newIngredients = [];
                let ingredientData = {};
                if(req.files.ingredients !== undefined){
                    ingredientData = fs.readFileSync(req.files.ingredients.tempFilePath).toString();
                    fs.unlink(req.files.ingredients.tempFilePath, ()=>{});
                    ingredientData = ingredientData.split("\n");
                    
                    merchant.inventory = [];
                    for(let i = 0; i < ingredientData.length; i++){
                        if(ingredientData[i] === "") continue;
                        let data = ingredientData[i].split(",");
                        let ingredient = new Ingredient({
                            name: data[0],
                            category: data[1],
                            unit: data[3],
                            ingredients: [],
                            convert: {
                                toMass: data[6] || 0,
                                toVolume: data[7] || 0,
                                toLength: data[8] || 0,
                                toBottle: 0
                            }
                        });

                        switch(data[3]){
                            case "g": ingredient.convert.toMass = 1; break;
                            case "kg": ingredient.convert.toMass = 1; break;
                            case "oz": ingredient.convert.toMass = 1; break;
                            case "lb": ingredient.convert.toMass = 1; break;
                            case "ml": ingredient.convert.toVolume = 1; break;
                            case "l": ingredient.convert.toVolume = 1; break;
                            case "tsp": ingredient.convert.toVolume = 1; break;
                            case "tbsp": ingredient.convert.toVolume = 1; break;
                            case "ozfl": ingredient.convert.toVolume = 1; break;
                            case "cup": ingredient.convert.toVolume = 1; break;
                            case "pt": ingredient.convert.toVolume = 1; break;
                            case "qt": ingredient.convert.toVolume = 1; break;
                            case "gal": ingredient.convert.toVolume = 1; break;
                            case "mm": ingredient.convert.toLength = 1; break;
                            case "cm": ingredient.convert.toLength = 1; break;
                            case "m": ingredient.convert.toLength = 1; break;
                            case "in": ingredient.convert.toLength = 1; break;
                            case "ft": ingredient.convert.toLength = 1; break;
                            case "bottle": ingredient.convert.toVolume = 1; break;
                        }

                        let merchIngredient = {
                            ingredient: ingredient._id,
                            quantity: helper.convertQuantityToBaseUnit(data[2], data[3]),
                        };

                        
                        if(ingredient.unit === "bottle"){
                            ingredient.altUnit = data[5];
                            ingredient.convert.toBottle = helper.convertQuantityToBaseUnit(data[4], data[5]);
                            merchIngredient.quantity = data[2] / ingredient.convert.toBottle;
                        }
                        
                        newIngredients.push(ingredient);
                        merchant.inventory.push(merchIngredient);
                    }
                }

                let indexIngredients = ()=>{
                    let ingredients = {};
                    let inventory = (req.files.ingredients === undefined) ? merchant.inventory : newIngredients;
                    for(let i = 0; i < inventory.length; i++){
                        if(req.files.ingredients === undefined){
                            ingredients[inventory[i].ingredient.name.toLowerCase()] = inventory[i].ingredient;
                        }else{
                            ingredients[inventory[i].name.toLowerCase()] = inventory[i];
                        }
                    }
                    return ingredients;
                }
                let ingredientIndices = indexIngredients();

                //Sub-ingredients
                if(req.files.ingredients !== undefined){
                    for(let i = 0; i < ingredientData.length; i++){
                        if(ingredientData[i] === "") continue;
                        let data = ingredientData[i].split(",");

                        for(let j = 9; j < data.length; j+=3){
                            if(data[j] === "") break;
                            ingredientIndices[data[0].toLowerCase()].ingredients.push({
                                ingredient: ingredientIndices[data[j].toLowerCase()]._id,
                                quantity: (data[j+1] * helper.convertQuantityToBaseUnit(1, data[j+2])) / helper.convertQuantityToBaseUnit(1, data[3]),
                                unit: data[j+2]
                            })
                        }
                    }
                }

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
                                quantity: helper.convertQuantityToBaseUnit(parseFloat(data[j+1]), data[j+2]),
                                unit: data[j+2]
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
                    Order.deleteMany({merchant: req.body.id}).catch((err)=>{});
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
                            taxes: parseInt(parseFloat(data[2]) * 100),
                            fees: parseInt(parseFloat(data[3]) * 100),
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
                    Transaction.deleteMany({merchant: req.body.id}).catch((err)=>{});
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
                return res.json("ERROR: A whoopsie has been made");
            });
    }
}