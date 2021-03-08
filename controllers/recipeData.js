const Recipe = require("../models/recipe.js");
const ArchivedRecipe = require("../models/archivedRecipe.js");

const helper = require("./helper.js");

const xlsx = require("xlsx");
const fs = require("fs");

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
        let recipe = new Recipe({
            merchant: res.locals.merchant._id,
            name: req.body.name,
            price: Math.round(req.body.price * 100),
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
        ingredients: [{
            ingredient: id of ingredient,
            quantity: quantity of ingredient in recipe
        }]
    }
    */
    updateRecipe: function(req, res){
        Recipe.findOne({_id: req.body.id})
            .then((recipe)=>{
                new ArchivedRecipe({
                    merchant: res.locals.merchant._id,
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
                return res.json("ERROR: UNABLE TO UPDATE DATA");
            });
    },

    //DELETE - removes a single recipe from the merchant and the database
    removeRecipe: function(req, res){
        if(res.locals.merchant.pos === "clover"){
            return res.json("YOU MUST EDIT YOUR RECIPES INSIDE CLOVER");
        }
        
        for(let i = 0; i < res.locals.merchant.recipes.length; i++){
            if(res.locals.merchant.recipes[i].toString() === req.params.id){
                res.locals.merchant.recipes.splice(i, 1);
                break;
            }
        }

        Promise.all([Recipe.deleteOne({_id: req.params.id}), res.locals.merchant.save()])
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
                return res.json("ERROR: UNABLE TO RETRIEVE DATA");
            });
    },

    createFromSpreadsheet: function(req, res){
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
            let title = "";
            try{title = array[0][i].toLowerCase()}
            catch{title = ""}

            switch(title){
                case "name": locations.name = i; break;
                case "price": locations.price = i; break;
                case "ingredients": locations.ingredient = i; break;
                case "ingredient amount": locations.amount = i; break;
            }
        }

        let merchant = {};
        let ingredients = [];
        res.locals.merchant
            .populate("inventory.ingredient")
            .execPopulate()
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
                    if(array[i][locations.ingredient] === undefined){
                        continue;
                    }

                    if(array[i][locations.name] !== undefined){
                        currentRecipe = {
                            merchant: res.locals.merchant._id,
                            name: array[i][locations.name],
                            price: parseInt(array[i][locations.price] * 100),
                            ingredients: []
                        }

                        recipes.push(currentRecipe);
                    }

                    let exists = false;
                    for(let j = 0; j < ingredients.length; j++){
                        if(ingredients[j].name.toLowerCase() === array[i][locations.ingredient].toLowerCase()){
                            currentRecipe.ingredients.push({
                                ingredient: ingredients[j].id,
                                quantity: helper.convertQuantityToBaseUnit(array[i][locations.amount], ingredients[j].unit)
                            });

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

    spreadsheetUpSquare: function(req, res){
        console.log("butt stuff");
    },

    spreadsheetTemplate: function(req, res){
        res.locals.merchant
            .populate("inventory.ingredient")
            .execPopulate()
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