const axios = require("axios");
const bcrypt = require("bcryptjs");

const Merchant = require("../models/merchant");
const Recipe = require("../models/recipe");
const InventoryAdjustment = require("../models/inventoryAdjustment");
const RecipeChange = require("../models/recipeChange");

module.exports = {
    /*
    POST - Create a new merchant with no POS system
    req.body = {
        name: retaurant name,
        email: registration email,
        password: password,
        confirmPassword: confirmation password
    }
    Redirects to /dashboard
    */
    createMerchantNone: function(req, res){
        if(req.body.password === req.body.confirmPassword){
            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(req.body.password, salt);

            let merchant = new Merchant({
                name: req.body.name,
                email: req.body.email.toLowerCase(),
                password: hash,
                pos: "none",
                lastUpdatedTime: Date.now(),
                createdAt: Date.now(),
                accountStatus: "valid",
                inventory: [],
                recipes: []
            });

            merchant.save()
                .then((merchant)=>{
                    req.session.user = merchant._id;

                    return res.redirect("/dashboard");
                })
                .catch((err)=>{
                    req.session.error = "Error: Unable to create account at this time";

                    return res.redirect("/");
                });
        }else{
            req.session.error = "Error: Passwords must match";

            return res.redirect("/");
        }
    },

    /*
    POST - Creates new Clover merchant
    Redirects to /dashboard
    */
    createMerchantClover: async function(req, res){
        axios.get(`${process.env.CLOVER_ADDRESS}/v3/merchants/${req.session.merchantId}?access_token=${req.session.accessToken}`)
            .then((response)=>{
                let merchant = new Merchant({
                    name: response.data.name,
                    pos: "clover",
                    posId: req.session.merchantId,
                    posAccessToken: req.session.accessToken,
                    lastUpdatedTime: Date.now(),
                    createdAt: Date.now(),
                    inventory: [],
                    recipes: []
                });

                axios.get(`${process.env.CLOVER_ADDRESS}/v3/merchants/${req.session.merchantId}/items?access_token=${req.session.accessToken}`)
                    .then((response)=>{
                        let recipes = [];
                        for(let item of response.data.elements){
                            let recipe = new Recipe({
                                posId: item.id,
                                merchant: merchant,
                                name: item.name,
                                price: item.price,
                                ingredients: []
                            });

                            recipes.push(recipe);
                            merchant.recipes.push(recipe);                                
                        }

                        Recipe.create(recipes)
                            .catch((err)=>{
                                req.session.error = "Error: unable to create your recipes from Clover.  Try using updating your recipes on the recipe page."
                            })

                        merchant.save()
                            .then((newMerchant)=>{
                                req.session.accessToken = undefined;
                                req.session.user = newMerchant._id;

                                return res.redirect("/dashboard");
                            })
                            .catch((err)=>{
                                req.session.error = "Error: unable to save data from Clover";

                                return res.redirect("/");
                            });
                    })
                    .catch((err)=>{
                        req.session.error = "Error: unable to retrieve necessary data from Clover";
                        return res.redirect("/");
                    })

                
            })
            .catch((err)=>{
                req.session.error = "Error: Unable to retrieve data from Clover";

                return res.redirect("/");
            });
    },

    //DELETE - removes a single recipe from the merchant
    removeRecipe: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                if(merchant.pos === "clover"){
                    return res.json("Error: you must edit your recipes inside Clover");
                }
                
                for(let i = 0; i < merchant.recipes.length; i++){
                    if(merchant.recipes[i].toString() === req.params.id){
                        merchant.recipes.splice(i, 1);
                        break;
                    }
                }

                merchant.save()
                    .then((updatedMerchant)=>{
                        return res.json({});
                    })
                    .catch((err)=>{
                        return res.json("Error: unable to save data")
                    })
            })
            .catch((err)=>{
                return res.json("Error: unable to retrieve merchant data");
            });
    },

    /*
    //POST - Adds an ingredient to merchant's inventory
    req.body = [ingredient objects]
    */
    addMerchantIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                for(let ingredient of req.body){
                    for(let item of merchant.inventory){
                        if(item.ingredient.toString() === ingredient.ingredient._id){
                            return res.json("Error: Duplicate ingredient detected");
                        }
                    }
                    
                    merchant.inventory.push({
                        ingredient: ingredient.ingredient._id,
                        quantity: ingredient.quantity
                    });
                }

                merchant.save()
                    .then((newMerchant)=>{
                        newMerchant.populate("inventory.ingredient", (err)=>{
                            if(err){
                                return res.json("Warning: refresh page to view updates");
                            }else{
                                return res.json({});
                            }
                        });
                    })
                    .catch((err)=>{
                        return res.json("Error: unable to save new ingredient");
                    });
            })
            .catch((err)=>{
                return res.json("Error: unable to retrieve user data");
            });
    },

    //POST - Removes an ingredient from the merchant's inventory
    removeMerchantIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
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

                merchant.save()
                    .then((merchant)=>{
                        return res.json({});
                    })
                    .catch((err)=>{
                        return res.json("Error: unable to save user data");
                    });
            })
            .catch((err)=>{
                return res.json("Error: unable to retrieve user data");
            });
    },

    /*
    POST - Update the quantity for a merchant inventory item
    req.body = [{
        id: id of ingredient to update,
        quantity: change in quantity
    }]
    */
    updateMerchantIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        let adjustments = [];

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                for(let i = 0; i < req.body.length; i++){
                    let updateIngredient;
                    for(let j = 0; j < merchant.inventory.length; j++){
                        if(merchant.inventory[j].ingredient.toString() === req.body[i].id){
                            updateIngredient = merchant.inventory[j];
                            break;
                        }
                    }

                    adjustments.push(new InventoryAdjustment({
                        date: Date.now(),
                        merchant: req.session.user,
                        ingredient: req.body[i].id,
                        quantity: req.body[i].quantity
                    }));

                    updateIngredient.quantity += req.body[i].quantity;
                }

                merchant.save()
                    .then((newMerchant)=>{
                        res.json({});

                        InventoryAdjustment.create(adjustments).catch(()=>{});
                        return;
                    })
                    .catch((err)=>{
                        return res.json("Error: your data could not be saved");
                    })
            })
            .catch((err)=>{
                return res.json("Error: your data could not be retrieved");
            });        
    },

    /*
    //POST - Update merchant password
    req.body = {
        oldPass: current merchant password (supposedly),
        newPass: replacement password
    }
    */
    updatePassword: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                bcrypt.compare(req.body.oldPass, merchant.password, (err, result)=>{
                    if(result){
                        let salt = bcrypt.genSaltSync(10);
                        let hash = bcrypt.hashSync(req.body.newPass, salt);

                        merchant.password = hash;
                        merchant.save()
                            .then((updatedMerchant)=>{
                                return res.json({});
                            })
                            .catch((err)=>{
                                return res.json("Error: Unable to save new password");
                            });
                    }else{
                        return res.json("Error: old password does not match current password");
                    }
                });
            })
            .catch((err)=>{
                return res.json("Error: Unable to retrieve merchant data");
            });
    }
}