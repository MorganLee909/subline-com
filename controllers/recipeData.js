const Recipe = require("../models/recipe.js");
const Merchant = require("../models/merchant.js");
const ArchivedRecipe = require("../models/archivedRecipe.js");

const validator = require("./validator.js");

const axios = require("axios");

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

        let validation = validator.recipe(req.body);
        if(validation !== true){
            return res.json(validation);
        }

        let recipe = new Recipe({
            merchant: req.session.user,
            name: req.body.name,
            price: Math.round(req.body.price * 100),
            ingredients: req.body.ingredients
        });


        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                merchant.recipes.push(recipe);
                merchant.save()
                    .catch((err)=>{
                        return res.json("ERROR: UNABLE TO SAVE RECIPE");
                    });
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE USER DATA");
            });

        recipe.save()
            .then((newRecipe)=>{
                return res.json(newRecipe);
            })
            .catch((err)=>{
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
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let validation = validator.recipe(req.body);
        if(validation !== true){
            return res.json(validation);
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
                return "ERROR: UNABLE TO RETRIEVE RECIPE DATA FROM SQUARE";
            });
    },

    createFromSpreadSheet: function(sheet, user){
        const array = xlsxUtils.sheet_to_json(sheet, {
            header: 1
        });

        //get property locations
        
    }
}