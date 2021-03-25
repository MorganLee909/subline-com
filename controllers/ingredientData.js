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
        let newIngredient = {...req.body};
        if(req.body.defaultUnit === "bottle"){
            newIngredient.ingredient.unitSize = helper.convertQuantityToBaseUnit(newIngredient.ingredient.unitSize, newIngredient.ingredient.unitType);
        }

        
        newIngredient = new Ingredient(newIngredient.ingredient);
        
        newIngredient.save()
            .then((ingredient)=>{
                newIngredient = {
                    ingredient: ingredient,
                    defaultUnit: req.body.defaultUnit
                }

                newIngredient.quantity = helper.convertQuantityToBaseUnit(req.body.quantity, req.body.defaultUnit);

                res.locals.owner.inventory.push(newIngredient);

                return res.locals.owner.save();
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
        Ingredient.findOne({_id: req.body.id})
            .then((ingredient)=>{
                ingredient.name = req.body.name,
                ingredient.category = req.body.category

                return ingredient.save();
            })
            .then((ingredient)=>{
                let updatedIngredient = {};
                for(let i = 0; i < res.locals.owner.inventory.length; i++){
                    if(res.locals.owner.inventory[i].ingredient.toString() === req.body.id){
                        res.locals.owner.inventory[i].defaultUnit = req.body.unit;

                        if(res.locals.owner.inventory[i].quantity !== req.body.quantity){
                            new InventoryAdjustment({
                                date: new Date(),
                                merchant: req.session.owner,
                                ingredient: req.body.id,
                                quantity: req.body.quantity - res.locals.owner.inventory[i].quantity
                            }).save().catch(()=>{});

                            res.locals.owner.inventory[i].quantity = req.body.quantity;
                        }

                        updatedIngredient = {
                            ingredient: ingredient,
                            quantity: req.body.quantity,
                            defaultUnit: req.body.unit
                        }
                        
                        break;
                    }
                }

                res.locals.owner.save().catch((err)=>{throw err});
                return res.json(updatedIngredient);
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

    createFromSpreadsheet: function(req, res){
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
                case "bottle size": locations.bottleSize = i; break;
                case "bottle unit": locations.bottleUnit = i; break;
            }
        }

        //Create ingredients
        let ingredients = [];
        let merchantData = [];
        for(let i = 1; i < array.length; i++){
            let ingredient = new Ingredient({
                name: array[i][locations.name],
                category: array[i][locations.category],
                unitType: helper.getUnitType(array[i][locations.unit].toLowerCase())
            });

            if(array[i][locations.unit] === "bottle"){
                ingredient.unitType = array[i][locations.bottleUnit];
                ingredient.unitSize = helper.convertQuantityToBaseUnit(array[i][locations.bottleSize], array[i][locations.bottleUnit]);
            }

            let merchantItem = {
                ingredient: ingredient,
                quantity: helper.convertQuantityToBaseUnit(array[i][locations.quantity], array[i][locations.unit]),
                defaultUnit: array[i][locations.unit]
            }
            
            merchantData.push(merchantItem);
            ingredients.push(ingredient);
        }

        for(let i = 0; i < merchantData.length; i++){
            res.locals.owner.inventory.push(merchantData[i]);
        }

        //Update the database
        Promise.all([Ingredient.create(ingredients), res.locals.owner.save()])
            .then((response)=>{
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
        for(let i = 0; i < res.locals.owner.inventory.length; i++){
            if(req.params.id === res.locals.owner.inventory[i].ingredient._id.toString()){
                res.locals.owner.inventory.splice(i, 1);
                break;
            }
        }

        Promise.all([res.locals.owner.save(), Ingredient.deleteOne({_id: req.params.id})])
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
    }
}