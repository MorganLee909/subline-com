const Recipe = require("../models/recipe.js");
const Merchant = require("../models/merchant.js");
const ArchivedRecipe = require("../models/archivedRecipe.js");

const helper = require("./helper.js");

const axios = require("axios");
const xlsx = require("xlsx");
const fs = require("fs");
const { Console } = require("console");

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

        let recipe = new Recipe({
            merchant: req.session.user,
            name: req.body.name,
            price: Math.round(req.body.price * 100),
            ingredients: req.body.ingredients
        });

        recipe.save()
            .then((newRecipe)=>{
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

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                merchant.recipes.push(recipe);
                return merchant.save();
            })
            .catch((err)=>{});
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

        Recipe.findOne({_id: req.body.id})
            .then((recipe)=>{
                new ArchivedRecipe({
                    merchant: req.session.user,
                    name: recipe.name,
                    price: recipe.price,
                    date: new Date(),
                    ingredients: recipe.ingredients
                }).save().catch(()=>{});

                recipe.name = req.body.name;
                recipe.price = req.body.price;
                recipe.ingredients = req.body.ingredients;

                return recipe.save();
            })
            .then((recipe)=>{
                res.json(recipe);
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO UPDATE RECIPE");
            });
    },

    //DELETE - removes a single recipe from the merchant and the database
    removeRecipe: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                if(merchant.pos === "clover"){
                    return res.json("YOU MUST EDIT YOUR RECIPES INSIDE CLOVER");
                }
                
                for(let i = 0; i < merchant.recipes.length; i++){
                    if(merchant.recipes[i].toString() === req.params.id){
                        merchant.recipes.splice(i, 1);
                        break;
                    }
                }

                merchant.save()
                    .catch((err)=>{
                        return res.json("ERROR: UNABLE TO SAVE DATA");
                    })

                return Recipe.deleteOne({_id: req.params.id});
            })
            .then((response)=>{
                return res.json({});
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO RETRIEVE USER DATA");
            });
    },

    //GET - Checks clover for new or deleted recipes
    //Returns: 
    //  merchant: Full merchant (recipe ingredients populated)
    //  count: Number of new recipes
    updateRecipesClover: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        let merchant = {};
        let newRecipes = [];
        let deletedRecipes = []
        Merchant.findOne({_id: req.session.user})
            .populate("recipes")
            .then((response)=>{
                merchant = response;
                return axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchant.posId}/items?access_token=${merchant.posAccessToken}`);
            })
            .then((result)=>{
                deletedRecipes = merchant.recipes.slice();
                for(let i = 0; i < result.data.elements.length; i++){
                    for(let j = 0; j < deletedRecipes.length; j++){
                        if(result.data.elements[i].id === deletedRecipes[j].posId){
                            result.data.elements.splice(i, 1);
                            deletedRecipes.splice(j, 1);
                            i--;
                            break;
                        }
                    }
                }

                for(let i = 0; i < deletedRecipes.length; i++){
                    for(let j = 0; j < merchant.recipes.length; j++){
                        if(deletedRecipes[i]._id === merchant.recipes[j]._id){
                            merchant.recipes.splice(j, 1);
                            break;
                        }
                    }
                }

                for(let i = 0; i < result.data.elements.length; i++){
                    let newRecipe = new Recipe({
                        posId: result.data.elements[i].id,
                        merchant: merchant._id,
                        name: result.data.elements[i].name,
                        ingredients: [],
                        price: result.data.elements[i].price
                    });

                    merchant.recipes.push(newRecipe);
                    newRecipes.push(newRecipe);
                }

                Recipe.create(newRecipes).catch((err)=>{});

                return merchant.save();
            })
            .then((newMerchant)=>{
                return res.json({new: newRecipes, removed: deletedRecipes});
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO RETRIEVE MERCHANT DATA");
            });
    },

    updateRecipesSquare: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        let merchant = {};
        let merchantRecipes = [];
        let newRecipes = [];

        Merchant.findOne({_id: req.session.user})
            .populate("recipes")
            .then((fetchedMerchant)=>{
                merchant = fetchedMerchant;
                return axios.post(`${process.env.SQUARE_ADDRESS}/v2/catalog/search`, {
                    object_types: ["ITEM"]
                }, {
                    headers: {
                        Authorization: `Bearer ${merchant.posAccessToken}`
                    }
                });
            })
            .then((response)=>{
                merchantRecipes = merchant.recipes.slice();

                
                for(let i = 0; i < response.data.objects.length; i++){
                    let itemData = response.data.objects[i].item_data;
                    for(let j = 0; j < itemData.variations.length; j++){
                        let isFound = false;

                        for(let k = 0; k < merchantRecipes.length; k++){
                            if(itemData.variations[j].id === merchantRecipes[k].posId){
                                merchantRecipes.splice(k, 1);
                                k--;
                                isFound = true;
                                break;
                            }
                        }

                        if(!isFound){
                            let newRecipe = new Recipe({
                                posId: itemData.variations[j].id,
                                merchant: merchant._id,
                                name: "",
                                price: itemData.variations[j].item_variation_data.price_money.amount,
                                ingredients: []
                            });

                            if(itemData.variations.length > 1){
                                newRecipe.name = `${itemData.name} '${itemData.variations[j].item_variation_data.name}'`;
                            }else{
                                newRecipe.name = itemData.name;
                            }

                            newRecipes.push(newRecipe);
                            merchant.recipes.push(newRecipe);
                        }
                    }
                }

                let ids = [];
                for(let i = 0; i < merchantRecipes.length; i++){
                    ids.push(merchantRecipes[i]._id);
                    for(let j = 0; j < merchant.recipes.length; j++){
                        if(merchantRecipes[i]._id.toString() === merchant.recipes[j]._id.toString()){
                            merchant.recipes.splice(j, 1);
                            j--;
                            break;
                        }
                    }
                }

                if(newRecipes.length > 0){
                    Recipe.create(newRecipes);
                }

                if(merchantRecipes.length > 0){
                    Recipe.deleteMany({_id: {$in: ids}});
                }

                return merchant.save();
            })
            .then((merchant)=>{
                return res.json({new: newRecipes, removed: merchantRecipes});
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO RETRIEVE RECIPE DATA FROM SQUARE");
            });
    },

    createFromSpreadsheet: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        //read file, get the correct sheet, create array from sheet
        let workbook = xlsx.readFile(req.file.path);
        fs.unlink(req.file.path, ()=>{});

        let sheets = Object.keys(workbook.Sheets);
        let sheet = {};
        for(let i = 0; i < sheets.length; i++){
            let str = sheets[i].toLowerCase();
            if(str === "recipe" || str === "recipes"){
                sheet = workbook.Sheets[sheets[i]];
            }
        }

        const array = xlsx.utils.sheet_to_json(sheet, {
            header: 1
        });

        //get property locations
        let locations = {};
        for(let i = 0; i < array[0].length; i++){
            switch(array[0][i].toLowerCase()){
                case "name": locations.name = i; break;
                case "price": locations.price = i; break;
                case "ingredients": locations.ingredient = i; break;
                case "ingredient amount": locations.amount = i; break;
            }
        }

        let merchant = {};
        let ingredients = [];
        Merchant.findOne({_id: req.session.user})
            .populate("inventory.ingredient")
            .then((response)=>{
                merchant = response;

                for(let i = 0; i < merchant.inventory.length; i++){
                    ingredients.push({
                        id: merchant.inventory[i].ingredient._id,
                        name: merchant.inventory[i].ingredient.name.toLowerCase(),
                        unit: merchant.inventory[i].defaultUnit,
                        specialUnit: merchant.inventory[i].specialUnit,
                        unitSize: merchant.inventory[i].unitSize
                    });
                }

                let recipes = [];
                let currentRecipe = {};
                for(let i = 1; i < array.length; i++){
                    if(array[i].length === 0){
                        continue;
                    }

                    if(array[i][locations.name] !== undefined){
                        currentRecipe = {
                            merchant: req.session.user,
                            name: array[i][locations.name],
                            price: parseInt(array[i][locations.price] * 100),
                            ingredients: []
                        }

                        recipes.push(currentRecipe);
                    }

                    let exists = false;
                    for(let j = 0; j < ingredients.length; j++){
                        if(ingredients[j].name === array[i][locations.ingredient]){
                            if(ingredients[j].specialUnit = "bottle"){
                                currentRecipe.ingredients.push({
                                    ingredient: ingredients[j].id,
                                    quantity: array[i][locations.amount]
                                });
                            }else{
                                currentRecipe.ingredients.push({
                                    ingredient: ingredients[j].id,
                                    quantity: helper.convertQuantityToBaseUnit(array[i][locations.amount], ingredients[j].unit)
                                });
                            }

                            exists = true;
                            break;
                        }
                    }

                    if(exists === false){
                        throw `CANNOT FIND INGREDIENT ${array[i][locations.ingredient]} FROM RECIPE ${array[i][locations.name]}`;
                    }
                }
                
                return Recipe.create(recipes);
            })
            .then((response)=>{
                recipes = response;

                for(let i = 0; i < recipes.length; i++){
                    merchant.recipes.push(recipes[i]._id);
                }

                return merchant.save();
            })
            .then((merchant)=>{
                return res.json(recipes);
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO CREATE YOUR RECIPES");
            });
    },

    spreadsheetTemplate: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }
        
        Merchant.findOne({_id: req.session.user})
            .populate("inventory.ingredient")
            .then((merchant)=>{
                let workbook = xlsx.utils.book_new();
                workbook.SheetNames.push("Recipes");
                let workbookData = [];

                workbookData.push(["Name", "Price", "Ingredients", "Ingredient Amount", "", "Ingredients Reference", "Ingredient Unit"]);
                
                for(let i = 0; i < merchant.inventory.length; i++){
                    workbookData.push(["", "", "", "", "", merchant.inventory[i].ingredient.name, merchant.inventory[i].defaultUnit]);
                }

                if(workbookData.length < 5){
                    for(let i = workbookData.length - 1; i < 5; i++){
                        workbookData.push(["", "", "", ""]);
                    }
                }

                workbookData[1][0] = "Example Recipe 1";
                workbookData[1][1] = 10.98;
                workbookData[1][2] = "Example Ingredient 1";
                workbookData[1][3] = 1.2;
                workbookData[2][2] = "Example Ingredient 2";
                workbookData[2][3] =  0.55;
                workbookData[3][0] = "Example Recipe 2";
                workbookData[3][1] = 5.54;
                workbookData[3][2] = "Example Ingredient 3";
                workbookData[3][3] = 1;
                workbookData[4][2] = "Example Ingredient 4";
                workbookData[4][3] = 1.53; 

                workbook.Sheets.Recipes = xlsx.utils.aoa_to_sheet(workbookData);
                xlsx.writeFile(workbook, "SublineRecipes.xlsx");
                return res.download("SublineRecipes.xlsx", (err)=>{
                    fs.unlink("SublineRecipes.xlsx", ()=>{});
                });
            })
            .catch((err)=>{});
    }
}