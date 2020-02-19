const axios = require("axios");
const bcrypt = require("bcryptjs");

const Merchant = require("../models/merchant");
const Recipe = require("../models/recipe");
const InventoryAdjustment = require("../models/inventoryAdjustment");
const RecipeChange = require("../models/recipeChange");

const token = "b48068eb-411a-918e-ea64-52007147e42c";

module.exports = {
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
                axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchant.posId}/items?access_token=${token}`)
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

    //POST - Adds an ingredient to merchant's inventory
    //Inputs:
    //  req.body.ingredient: ingredient id
    //  req.body.quantity: quantity for the ingredient
    //Returns:
    //  ingredient: Newly added ingredient
    addMerchantIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                for(let item of merchant.inventory){
                    if(item.ingredient.toString() === req.body.ingredient){
                        return res.json("Ingredient is already in your inventory");
                    }
                }

                merchant.inventory.push(req.body);
                merchant.save()
                    .then((newMerchant)=>{
                        newMerchant.populate("inventory.ingredient", (err)=>{
                            if(err){
                                return res.json("Warning: refresh page to view updates");
                            }else{
                                let newIngredient = newMerchant.inventory.find(i => i.ingredient._id.toString() === req.body.ingredient);
                                return res.json(newIngredient);
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
    //Inputs: 
    //  ingredientId: id of ingredient to remove
    //Returns: Nothing
    removeMerchantIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                for(let i = 0; i < merchant.inventory.length; i++){
                    if(req.body.ingredientId === merchant.inventory[i].ingredient._id.toString()){
                        merchant.inventory.splice(i, 1);
                        break;
                    }
                }

                merchant.save()
                    .then((merchant)=>{
                        return res.json(req.body);
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
    //  req.body.ingredientId: Id of ingredient to update
    //  req.body.quantityChange: Amount to change ingredient (not the new value)
    //Returns: Nothing
    updateMerchantIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                let updateIngredient = merchant.inventory.find(i => i.ingredient.toString() === req.body.ingredientId);
                updateIngredient.quantity = (updateIngredient.quantity + req.body.quantityChange).toFixed(2);
                merchant.save()
                    .then((newMerchant)=>{
                        res.json({});
                    })
                    .catch((err)=>{
                        return res.json("Error: your data could not be saved");
                    })
            })
            .catch((err)=>{
                return res.json("Error: your data could not be retrieved");
            });

        let invAdj = new InventoryAdjustment({
            date: Date.now(),
            merchant: req.session.user,
            ingredient: req.body.ingredientId,
            quantity: req.body.quantityChange
        });

        invAdj.save().catch((err)=>{});
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