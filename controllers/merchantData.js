const axios = require("axios");
const bcrypt = require("bcryptjs");

const Merchant = require("../models/merchant");
const Recipe = require("../models/recipe");
const InventoryAdjustment = require("../models/inventoryAdjustment");
const Validator = require("./validator.js");

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
    createMerchantNone: async function(req, res){
        let validation =  await Validator.merchant(req.body);
        if(validation !== true){
            req.session.error = validation;
            return res.redirect("/");
        }

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
                    req.session.error = "ERROR: UNABLE TO CREATE ACCOUNT AT THIS TIME";

                    return res.redirect("/");
                });
        }else{
            req.session.error = "PASSWORDS DO NOT MATCH";

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
                                req.session.error = "ERROR: UNABLE TO CREATE YOUR RECIPES FROM CLOVER."
                            })

                        merchant.save()
                            .then((newMerchant)=>{
                                req.session.accessToken = undefined;
                                req.session.user = newMerchant._id;

                                return res.redirect("/dashboard");
                            })
                            .catch((err)=>{
                                req.session.error = "ERROR: UNABLE TO SAVE DATA FROM CLOVER";

                                return res.redirect("/");
                            });
                    })
                    .catch((err)=>{
                        req.session.error = "ERROR: UNABLE TO RETRIEVE DATA FROM CLOVER";
                        return res.redirect("/");
                    })

                
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO RETRIEVE DATA FROM CLOVER";

                return res.redirect("/");
            });
    },

    //DELETE - removes a single recipe from the merchant
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
                    .then((updatedMerchant)=>{
                        return res.json({});
                    })
                    .catch((err)=>{
                        return res.json("ERROR: UNABLE TO SAVE DATA");
                    })
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE USER DATA");
            });
    },

    /*
    //POST - Adds an ingredient to merchant's inventory
    req.body = [{
        id: ingredient id,
        quantity: quantity of ingredient for the merchant
    }]
    */
    addMerchantIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let validation;
        for(let i = 0; i < req.body.length; i++){
            validation = Validator.quantity(req.body[i].quantity);
            if(validation !== true){
                return res.json(validation);
            }
        }
        

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                for(let i = 0; i < req.body.length; i++){
                    for(let j = 0; j < merchant.inventory.length; j++){
                        if(merchant.inventory[j].ingredient.toString() === req.body[i].id){
                            return res.json("ERROR: DUPLICATE INGREDIENT DETECTED");
                        }
                    }
                    
                    merchant.inventory.push({
                        ingredient: req.body[i].id,
                        quantity: req.body[i].quantity
                    });
                }

                merchant.save()
                    .then((newMerchant)=>{
                        return res.json({});
                    })
                    .catch((err)=>{
                        return res.json("ERROR: UNABLE TO SAVE NEW INGREDIENT");
                    });
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE USER DATA");
            });
    },

    //POST - Removes an ingredient from the merchant's inventory
    removeMerchantIngredient: function(req, res){
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

                merchant.save()
                    .then((merchant)=>{
                        return res.json({});
                    })
                    .catch((err)=>{
                        return res.json("ERROR: UNABLE TO SAVE USER DATA");
                    });
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE USER DATA");
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
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        for(let i = 0; i < req.body.length; i++){
            let validation = Validator.quantity(req.body[i].quantity);
            if(validation !== true){
                return res.json(validation);
            }
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
                        quantity: req.body[i].quantity - updateIngredient.quantity
                    }));

                    updateIngredient.quantity = req.body[i].quantity;
                }

                merchant.save()
                    .then((newMerchant)=>{
                        res.json({});

                        InventoryAdjustment.create(adjustments).catch(()=>{});
                        return;
                    })
                    .catch((err)=>{
                        return res.json("ERROR: UNABLE TO SAVE DATA");
                    })
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE DATA");
            });        
    },

    /*
    POST - Changes the users password
    req.body = {
        pass: new password,
        confirmPass: new password confirmation,
        hash: hashed version of old password
    }
    */
    updatePassword: function(req, res){
        let validation = Validator.password(req.body.pass, req.body.confirmPass);
        if(validation !== true){
            return res.json(validation);
        }

        Merchant.findOne({password: req.body.hash})
            .then((merchant)=>{
                if(merchant){
                    let salt = bcrypt.genSaltSync(10);
                    let hash = bcrypt.hashSync(req.body.pass, salt);

                    merchant.password = hash;

                    return merchant.save();
                }else{
                    req.session.error = "ERROR: UNABLE TO RETRIEVE USER DATA";
                    return res.redirect("/");
                }
            })
            .then((merchant)=>{
                req.session.error = "PASSWORD SUCCESSFULLY RESET. PLEASE LOG IN";
                return res.redirect("/");
            })
            .catch((err)=>{});
    }
}