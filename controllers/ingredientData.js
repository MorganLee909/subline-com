const Merchant = require("../models/merchant");
const Ingredient = require("../models/ingredient");
const InventoryAdjustment = require("../models/inventoryAdjustment.js");

const helper = require("./helper.js");
const validator = require("./validator.js");

const xlsxUtils = require("xlsx").utils;

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
                return res.json("ERROR: UNABLE TO RETRIEVE INGREDIENTS");
            });
    },

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

        let validation = validator.ingredient(req.body.ingredient);
        if(validation !== true){
            return res.json(validation);
        }

        validation = validator.quantity(req.body.quantity);
        if(validation !== true){
            return res.json(validation);
        }

        if(req.body.ingredient.unitSize){
            validation = validator.quantity(req.body.ingredient.unitSize);
            if(validation !== true){
                return res.json(validation);
            }
        }

        let newIngredient = {};
        if(req.body.ingredient.specialUnit === "bottle"){
            newIngredient = new Ingredient({
                name: req.body.ingredient.name,
                category: req.body.ingredient.category,
                unitType: req.body.ingredient.unitType,
                specialUnit: req.body.ingredient.specialUnit,
                unitSize: helper.convertQuantityToBaseUnit(req.body.ingredient.unitSize, req.body.defaultUnit)
            });
        }else{
            newIngredient = new Ingredient(req.body.ingredient);
        }

        let ingredientPromise = newIngredient.save();
        let merchantPromise = Merchant.findOne({_id: req.session.user});

        Promise.all([ingredientPromise, merchantPromise])
            .then((response)=>{
                newIngredient = {
                    ingredient: response[0],
                    defaultUnit: req.body.defaultUnit
                }

                if(response[0].specialUnit === "bottle"){
                    newIngredient.quantity = req.body.quantity * response[0].unitSize;
                }else{
                    newIngredient.quantity = helper.convertQuantityToBaseUnit(req.body.quantity, req.body.defaultUnit);
                }

                response[1].inventory.push(newIngredient);

                return response[1].save();
            })
            .then((response)=>{
                return res.json(newIngredient);
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO CREATE NEW INGREDIENT");
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
        unitSize: unit size for special unit, if any
    }
    */
    updateIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        const ingredientCheck = validator.ingredient(req.body);
        if(ingredientCheck !== true){
            return res.json(ingredientCheck);
        }

        let updatedIngredient = {};
        Ingredient.findOne({_id: req.body.id})
            .then((ingredient)=>{
                ingredient.name = req.body.name,
                ingredient.category = req.body.category
                if(ingredient.specialUnit === "bottle"){
                    ingredient.unitSize = req.body.unitSize;
                }

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

                        updatedIngredient.quantity = req.body.quantity;
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
                return res.json("ERROR: UNABLE TO UPDATE INGREDIENT");
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

                return merchant.save()
            })
            .then((merchant)=>{
                return Ingredient.deleteOne({_id: req.params.id});
            })
            .then((ingredient)=>{
                return res.json({});
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE USER DATA");
            });
    },

    createFromSpreadsheet: function(sheet, user){
        const array = xlsxUtils.sheet_to_json(sheet, {
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
                ingredient.unitType = "volume";
                ingredient.specialUnit = "bottle";
                ingredient.unitSize = helper.convertQuantityToBaseUnit(array[i][locations.bottleSize], array[i][locations.unit]);
            }else{
                let unitType = "";
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
        let createdIngredients = [];
        return Ingredient.create(ingredients)
            .then((ingredients)=>{
                createdIngredients = ingredients;

                return Merchant.findOne({_id: user});
            })
            .then((merchant)=>{
                for(let i = 0; i < merchantData.length; i++){
                    merchant.inventory.push(merchantData[i]);
                }

                return merchant.save();
            })
            .then((merchant)=>{
                return merchantData;
            })
            .catch((err)=>{
                return "ERROR: UNABLE TO CREATE YOUR INGREDIENTS";
            });
    }
}