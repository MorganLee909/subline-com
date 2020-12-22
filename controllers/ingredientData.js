const Merchant = require("../models/merchant");
const Ingredient = require("../models/ingredient");
const InventoryAdjustment = require("../models/inventoryAdjustment.js");

const helper = require("./helper.js");

const xlsx = require("xlsx");
const fs = require("fs");

module.exports = {
    /*
    POST - create a single ingredient and then add to the merchant
    req.body = {
        ingredient: {
            name: name of ingredient,
            category: category of ingredient,
            unitType: category for the unit (mass, volume, length)
        },
        quantity: quantity of ingredient for current merchant,
        defaultUnit: default unit of measurement to display
    }
    Returns:
        Same as above, with the _id
    */
    createIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let newIngredient = {};
        newIngredient = new Ingredient(req.body.ingredient);

        let ingredientPromise = newIngredient.save();
        let merchantPromise = Merchant.findOne({_id: req.session.user});

        Promise.all([ingredientPromise, merchantPromise])
            .then((response)=>{
                newIngredient = {
                    ingredient: response[0],
                    defaultUnit: req.body.defaultUnit
                }

                //TODO this should come in as the base unit
                newIngredient.quantity = helper.convertQuantityToBaseUnit(req.body.quantity, req.body.defaultUnit);

                response[1].inventory.push(newIngredient);

                return response[1].save();
            })
            .then((response)=>{
                return res.json(newIngredient);
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO CREATE THE INGREDIENT");
            });
    },

    /*
    POST - Updates data for a single ingredient
    req.body = {
        id: id of the ingredient,
        name: new name of the ingredient,
        quantity: new quantity of the unit (in grams),
        category: new category of the unit,
        unit: new default unit of the ingredient,
    }
    */
    updateIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }
        let updatedIngredient = {};
        Ingredient.findOne({_id: req.body.id})
            .then((ingredient)=>{
                ingredient.name = req.body.name,
                ingredient.category = req.body.category

                return ingredient.save();
            })
            .then((ingredient)=>{
                updatedIngredient.ingredient = ingredient;
                return Merchant.findOne({_id: req.session.user});
            })
            .then((merchant)=>{
                for(let i = 0; i < merchant.inventory.length; i++){
                    if(merchant.inventory[i].ingredient.toString() === req.body.id){
                        merchant.inventory[i].defaultUnit = req.body.unit;

                        if(merchant.inventory[i].quantity !== req.body.quantity){
                            new InventoryAdjustment({
                                date: new Date(),
                                merchant: req.session.user,
                                ingredient: req.body.id,
                                quantity: req.body.quantity - merchant.inventory[i].quantity
                            }).save().catch(()=>{});

                            merchant.inventory[i].quantity = req.body.quantity;
                        }

                        updatedIngredient.quantity = helper.convertQuantityToBaseUnit(req.body.quantity, req.body.unit);
                        updatedIngredient.unit = req.body.unit;
                        
                        break;
                    }
                }

                return merchant.save();
            })
            .then((merchant)=>{
                return res.json(updatedIngredient);
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO UDATE THE INGREDIENT");
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
            if(str === "ingredient" || str === "ingredients"){
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
                case "category": locations.category = i; break;
                case "quantity": locations.quantity = i; break;
                case "unit": locations.unit = i; break;
                case "bottle": locations.bottle = i; break;
                case "bottle size": locations.bottleSize = i; break;
            }
        }

        //Create ingredients
        let ingredients = [];
        let merchantData = [];
        for(let i = 1; i < array.length; i++){
            let ingredient = new Ingredient({
                name: array[i][locations.name],
                category: array[i][locations.category]
            });

            let merchantItem = {
                ingredient: ingredient,
                quantity: helper.convertQuantityToBaseUnit(array[i][locations.quantity], array[i][locations.unit]),
                defaultUnit: array[i][locations.unit]
            }

            if(array[i][locations.bottle] === true){
                let quantity = array[i][locations.quantity] * array[i][locations.bottleSize];
                merchantItem.quantity = helper.convertQuantityToBaseUnit(quantity, array[i][locations.unit]);
                
                ingredient.unitType = "volume";
                ingredient.specialUnit = "bottle";
                ingredient.unitSize = helper.convertQuantityToBaseUnit(array[i][locations.bottleSize], array[i][locations.unit]);
            }else{
                let unitType = "";
                //TODO: this should probably be in a helper
                switch(array[i][locations.unit].toLowerCase()){
                    case "g": unitType = "mass"; break;
                    case "kg": unitType = "mass"; break;
                    case "oz": unitType = "mass"; break;
                    case "lb": unitType = "mass"; break;
                    case "ml": unitType = "volume"; break;
                    case "l": unitType = "volume"; break;
                    case "tsp": unitType = "volume"; break;
                    case "tbsp": unitType = "volume"; break;
                    case "ozfl": unitType = "volume"; break;
                    case "cup": unitType = "volume"; break;
                    case "pt": unitType = "volume"; break;
                    case "qt": unitType = "volume"; break;
                    case "gal": unitType = "volume"; break;
                    case "mm": unitType = "length"; break;
                    case "cm": unitType = "length"; break;
                    case "m": unitType = "length"; break;
                    case "in": unitType = "length"; break;
                    case "ft": unitType = "length"; break;
                    default: unitType = "other";
                }

                ingredient.unitType = unitType;
            }

            merchantData.push(merchantItem);
            ingredients.push(ingredient);
        }

        //Update the database
        Ingredient.create(ingredients)
            .then((ingredients)=>{
                return Merchant.findOne({_id: req.session.user});
            })
            .then((merchant)=>{
                for(let i = 0; i < merchantData.length; i++){
                    merchant.inventory.push(merchantData[i]);
                }

                return merchant.save();
            })
            .then((merchant)=>{
                return res.json(merchantData);
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return "ERROR: UNABLE TO CREATE YOUR INGREDIENTS";
            });
    },

    spreadsheetTemplate: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let workbook = xlsx.utils.book_new();
        workbook.SheetNames.push("Ingredients");
        let workbookData = [];

        workbookData.push(["Name", "Category", "Quantity", "Unit", "Bottle Size", "Bottle Unit"]);
        workbookData.push(["Example Ingredient 1", "Produce", 100, "lbs"]);
        workbookData.push(["Example Ingredient 2", "Fruit", 3.24, "kg"]);
        workbookData.push(["Example Ingredient 3", "Beverage", 5, "bottle", 750, "ml"]);

        workbook.Sheets.Ingredients = xlsx.utils.aoa_to_sheet(workbookData);
        xlsx.writeFile(workbook, "SublineIngredients.xlsx");
        return res.download("SublineIngredients.xlsx", (err)=>{
            fs.unlink("SublineIngredients.xlsx", ()=>{});
        });
    },

    //DELETE - Removes an ingredient from the merchant's inventory
    removeIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                for(let i = 0; i < merchant.inventory.length; i++){
                    if(req.params.id === merchant.inventory[i].ingredient._id.toString()){
                        merchant.inventory.splice(i, 1);
                        break;
                    }
                }

                return Promise.all([merchant.save(), Ingredient.deleteOne({_id: req.params.id})]);
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
}