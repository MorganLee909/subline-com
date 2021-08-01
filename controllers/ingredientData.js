const Ingredient = require("../models/ingredient");

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
            convert: {
                toMass: Number
                toVolume: Number
                toLength: Number
            }
            unit: String
        }
            quantity: quantity of ingredient for current merchant,
    }
    Returns:
        Same as above, with the _id
    */
    createIngredient: function(req, res){
        let newIngredient = new Ingredient({
            name: req.body.ingredient.name,
            category: req.body.ingredient.category,
            unit: req.body.ingredient.unit,
            convert: req.body.ingredient.convert,
            ingredients: []
        });
        
        newIngredient.save()
            .then((ingredient)=>{
                newIngredient = {
                    ingredient: ingredient,
                    quantity: req.body.quantity,
                }

                res.locals.merchant.inventory.push(newIngredient);

                return res.locals.merchant.save();
            })
            .then((response)=>{
                return res.json(newIngredient);
            })
            .catch((err)=>{
                if(typeof(err) === "string") return res.json(err);
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO CREATE THE INGREDIENT");
            });
    },

    /*
    PUT: Updates data for a single ingredient
    req.body = {
        ingredient: {
            id: String (id of Ingredient)
            name: String
            category: String
            unit: String
            convert: {
                toMass: Number
                toVolume: Number
                toLength: Number
            }
        }
        quantity: Number
    }
    response = Ingredient
    */
    updateIngredient: function(req, res){
        Ingredient.findOne({_id: req.body.ingredient.id})
            .then((ingredient)=>{
                ingredient.name = req.body.ingredient.name;
                ingredient.category = req.body.ingredient.category;
                ingredient.convert = req.body.ingredient.convert;
                ingredient.unit = req.body.ingredient.unit;
                
                //find and update ingredient on merchant
                for(let i = 0; i < res.locals.merchant.inventory.length; i++){
                    if(res.locals.merchant.inventory[i].ingredient.toString() === req.body.ingredient.id){
                        res.locals.merchant.inventory[i].quantity = req.body.quantity;         
                        break;
                    }
                }
                return Promise.all([ingredient.save(), res.locals.merchant.save()])
            })
            .then((response)=>{
                return res.json({
                    ingredient: response[0],
                    quantity: req.body.quantity
                });
            })
            .catch((err)=>{
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO UPDATE DATA");
            });
    },

    /*
    PUT: updates subingredients on an ingredient
    req.body = {
        id: String (top-level ingredient id),
        ingredients: [{
            ingredient: String (id)
            quantity: Number
            unit: String
        }]
    }
    response = Ingredient
    error response = '$' delimited String
    */
    updateSubIngredients: function(req, res){
        let popMerchant = res.locals.merchant.populate("inventory.ingredient").execPopulate();

        let stack = [];
        Promise.all([Ingredient.findOne({_id: req.body.id}), popMerchant])
            .then((response)=>{
                response[0].ingredients = req.body.ingredients;

                // Check ingredients for circular references
                let isCircular = (ingredient, original)=>{

                    if(ingredient.ingredients.length === 0) {
                        stack.pop();
                        return false;
                    }

                    for(let i = 0; i < ingredient.ingredients.length; i++){
                        for(let j = 0; j < res.locals.merchant.inventory.length; j++){
                            if(res.locals.merchant.inventory[j].ingredient._id.toString() === ingredient.ingredients[i].ingredient.toString()){
                                let next = res.locals.merchant.inventory[j].ingredient;
                                stack.push(next);
                                if(next._id.toString() === original._id.toString()) return true;
                                return isCircular(next, original);
                            }
                        }
                    }
                }
                
                for(let i = 0; i < req.body.ingredients.length; i++){
                    for(let j = 0; j < res.locals.merchant.inventory.length; j++){
                        if(res.locals.merchant.inventory[j].ingredient._id.toString() === req.body.ingredients[i].ingredient){
                            let ingredient = res.locals.merchant.inventory[j].ingredient;
                            stack = [ingredient];
                            if(ingredient._id.toString() === req.body.id) throw "circular";
                            if(isCircular(ingredient, response[0]) === true) throw "circular";
                            break;
                        }
                    }
                }

                return Promise.all([response[0].save(), res.locals.merchant.save()])
            })
            .then((response)=>{
                return res.json(response[0]);
            })
            .catch((err)=>{
                if(err === "circular"){
                    let string = "YOU ATTEMPTED TO MAKE A CIRCULAR REFERENCE";

                    if(stack.length === 1){
                        string += `$${stack[0].name} CONTAINS ${stack[0].name}`;
                    }else{
                        for(let i = 0; i < stack.length; i++){
                            if(i === stack.length - 1){
                                string += `$${stack[i].name} CONTAINS ${stack[0].name}`;
                                break;
                            }
                            string += `$${stack[i].name} CONTAINS ${stack[i+1].name}`;
                        }
                    }
                    
                    return res.json(string);
                }
                return res.json("ERROR: UNABLE TO UPDATE YOUR SUB-INGREDIENTS");
            });
    },

    //DELETE - Removes an ingredient from the merchant's inventory
    removeIngredient: function(req, res){
        for(let i = 0; i < res.locals.merchant.inventory.length; i++){
            if(req.params.id === res.locals.merchant.inventory[i].ingredient._id.toString()){
                res.locals.merchant.inventory.splice(i, 1);
                break;
            }
        }

        Promise.all([res.locals.merchant.save(), Ingredient.deleteOne({_id: req.params.id})])
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