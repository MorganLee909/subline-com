const axios = require("axios");
const bcrypt = require("bcryptjs");

const Merchant = require("../models/merchant");
const Recipe = require("../models/recipe");
const InventoryAdjustment = require("../models/inventoryAdjustment");
const RecipeChange = require("../models/recipeChange");

module.exports = {
    //POST - Create a new merchant with no POS system
    //Inputs:
    //  req.body.name: restaurant name
    //  req.body.email: registration email
    //  req.body.password: password
    //  req.body.confirmPassword: confirmation password
    //Redirects to /dashboard
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

    //POST - Creates a Clover merchant from all entered data
    //Inputs:
    //  req.body.data: All data from frontend in form of merchant model
    //Redirect to /dashboard
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

    //GET - Checks clover for new or deleted recipes
    //Returns: 
    //  merchant: Full merchant (recipe ingredients populated)
    //  count: Number of new recipes
    updateRecipes: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .populate("recipes")
            .then((merchant)=>{
                axios.get(`${process.env.CLOVER_ADDRESS}/v3/merchants/${merchant.posId}/items?access_token=${merchant.posAccessToken}`)
                    .then((result)=>{
                        let deletedRecipes = merchant.recipes.slice();
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

                        for(let recipe of deletedRecipes){
                            for(let i = 0; i < merchant.recipes.length; i++){
                                if(recipe._id === merchant.recipes[i]._id){
                                    merchant.recipes.splice(i, 1);
                                    break;
                                }
                            }
                        }

                        let newRecipes = []
                        for(let recipe of result.data.elements){
                            let newRecipe = new Recipe({
                                posId: recipe.id,
                                merchant: merchant._id,
                                name: recipe.name,
                                ingredients: []
                            });

                            merchant.recipes.push(newRecipe);
                            newRecipes.push(newRecipe);
                        }

                        Recipe.create(newRecipes)
                            .catch((err)=>{
                                return res.json("Error: unable to create recipes");
                            });

                        merchant.save()
                            .then((newMerchant)=>{
                                newMerchant.populate(["recipes.ingredients.ingredient", "inventory.ingredient"]).execPopulate()
                                    .then((newestMerchant)=>{
                                        merchant.password = undefined;
                                        return res.json(newestMerchant);
                                    })
                                    .catch((err)=>{
                                        return res.json("Error: unable to retrieve user data");
                                    });
                            })
                            .catch((err)=>{
                                return res.json("Error: unable to retrieve user data");
                            });
                    })
                    .catch((err)=>{
                        return res.json("Error: unable to retrieve data from Clover");
                    });
            })
            .catch((err)=>{
                return res.json("Error: unable to retrieve user data");
            });
    },

    //DELETE - removes a single recipe
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

    //POST - Adds an ingredient to merchant's inventory
    //Inputs:
    //  req.body: array of objects (each object is a full ingredient)
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

    //POST - Update the quantity for a merchant inventory item
    //Inputs:
    //  req.body: array of ingredient data
    //      id: id of ingredient to update
    //      quantity: Change in quantity
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

    //POST - Adds an ingredient to a recipe
    //Inputs:
    //  req.body.recipeId: Id of recipe to change
    //  req.body.item:  Ingredient to add with a quantity
    //Returns: 
    //  recipe: Updated recipe with populated ingredients
    addRecipeIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Recipe.findOne({_id: req.body.recipeId})
            .then((recipe)=>{
                recipe.ingredients.push({
                    ingredient: req.body.item.ingredient,
                    quantity: req.body.item.quantity
                });
                
                recipe.save()
                    .then((recipe)=>{
                        recipe.populate("ingredients.ingredient", (err)=>{
                            if(err){
                                return res.json("Error: could not retrieve ingredients.  Please refresh page to see changes");
                            }
                            res.json(recipe);

                            let rc = new RecipeChange({
                                recipe: recipe,
                                ingredient: req.body.item.ingredient,
                                change: req.body.item.quantity
                            });
                            rc.save().catch((err)=>{});

                            return;
                        })
                    })
                    .catch((err)=>{
                        return res.json("Error: unable to save recipe data");
                    });
            })
            .catch((err)=>{
                return res.json("Error: unable to retrieve recipe data");
            });
    },

    //POST - Change quantity of a recipe's ingredient
    //Inputs:
    //  req.body.recipeId: Id of recipe containing the ingredient
    //  req.body.ingredient: The ingredient to update (_id and quantity)
    //Returns: Nothing
    updateRecipeIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Recipe.findOne({_id: req.body.recipeId})
            .then((recipe)=>{
                for(let ingredient of recipe.ingredients){
                    if(ingredient._id.toString() === req.body.ingredient._id){
                        let change = Number(req.body.ingredient.quantity) - ingredient.quantity;
                        ingredient.quantity = req.body.ingredient.quantity;

                        recipe.save()
                            .then((recipe)=>{
                                res.json({});

                                let rc = new RecipeChange({
                                    recipe: recipe,
                                    ingredient: ingredient.ingredient,
                                    change: change
                                });
                                rc.save().catch((err)=>{});

                                return;
                            })
                            .catch((err)=>{
                                return res.json("Error: Could not save recipe data");
                            });
                    }
                }
            })
            .catch((err)=>{
                return res.json("Error: unable to retrieve recipe data");
            });
    },

    //POST - Remove an ingredient from a recipe
    //Inputs:
    //  req.body.ingredientId: Id of ingredient to be removed
    //  req.body.recipeId: Id of recipe to remove ingredient from
    //  req.body.quantity: quantity of recipe ingredient for storing
    //Returns: Nothing
    removeRecipeIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Recipe.findOne({_id: req.body.recipeId})
            .then((recipe)=>{
                for(let i = 0; i < recipe.ingredients.length; i++){
                    if(recipe.ingredients[i].ingredient._id.toString() === req.body.ingredientId){
                        recipe.ingredients.splice(i, 1);
                        break;
                    }
                }

                recipe.save()
                    .then((recipe)=>{
                        res.json({});

                        let rc = new RecipeChange({
                            recipe: req.body.recipeId,
                            ingredient: req.body.ingredientId,
                            change: -req.body.quantity
                        });
                        rc.save().catch((err)=>{});

                        return;
                    })
                    .catch((err)=>{
                        return res.json("Error: unable to save recipe data");
                    });
            })
            .catch((err)=>{
                return res.json("Error: unable to retrieve recipe data");
            });
    },

    //POST - Update merchant information
    //Inputs:
    //  req.body.name: name update
    //  req.body.email: email update
    //Returns: Nothing
    updateMerchant: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                merchant.name = req.body.name;
                merchant.email = req.body.email;
                merchant.save()
                    .then((updatedMerchant)=>{
                        return res.json({});
                    })
                    .catch((err)=>{
                        return res.json("Error: unable to save merchant data");
                    });
            })
            .catch((err)=>{
                return res.json("Error: unable to retrieve merchant data");
            });
    },

    //POST - Update merchant password
    //Inputs:
    //  req.body.oldPass:  current merchant password (supposedly)
    //  req.body.newPass:  replacement password
    //Returns: Nothing
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