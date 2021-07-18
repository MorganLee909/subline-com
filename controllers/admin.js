const Merchant = require("../models/merchant.js");
const Ingredient = require("../models/ingredient.js");
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

                return Promise.all([
                    merchant.save(),
                    Ingredient.create(newIngredients)
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