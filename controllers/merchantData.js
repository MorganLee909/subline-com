const axios = require("axios");
const bcrypt = require("bcryptjs");

const Error = require("../models/error");
const Merchant = require("../models/merchant");
const Recipe = require("../models/recipe");
const Ingredient = require("../models/ingredient");
const InventoryAdjustment = require("../models/inventoryAdjustment");

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
                                let errorMessage = "There was an error and your new recipes could not be saved";
                                let error = new Error({
                                    code: 547,
                                    displayMessage: errorMessage,
                                    error: err
                                });
                                error.save();

                                return res.json(errorMessage);
                            });

                        merchant.save()
                            .then((newMerchant)=>{
                                newMerchant.populate("recipes.ingredients.ingredient").execPopulate()
                                    .then((newestMerchant)=>{
                                        merchant.password = undefined;
                                        return res.json({merchant: newestMerchant, count: result.data.elements.length});
                                    })
                                    .catch((err)=>{
                                        let errorMessage = "Unable to retrieve recipe ingredients";
                                        let error = new Error({
                                            code: 626,
                                            displayMessage: errorMessage,
                                            error: err
                                        });
                                        error.save();

                                        return res.json(errorMessage);
                                    });
                            })
                            .catch((err)=>{
                                let errorMessage = "Unable to save changes from Clover";
                                let error = new Error({
                                    code: 547,
                                    displayMessage: errorMessage,
                                    error: err
                                });
                                error.save();

                                return res.json(errorMessage);
                            });
                    })
                    .catch((err)=>{
                        let errorMessage = "Unable to retrieve data from Clover";
                        let error = new Error({
                            code: 111,
                            displayMessage: errorMessage,
                            error: err
                        });
                        error.save();

                        return res.json(errorMessage);
                    });
            })
            .catch((err)=>{
                let errorMessage = "Unable to retrieve merchant data";
                let error = new Error({
                    code: 626,
                    displayMessage: errorMessage,
                    error: err
                });
                error.save();

                return res.json(errorMessage);
            });
    },

    //POST - Creates a Clover merchant from all entered data
    //Inputs:
    //  req.body.data: All data from frontend in form of merchant model
    //Redirect to "/inventory"
    createMerchantClover: async function(req, res){
        let data = JSON.parse(req.body.data);
        data.email = data.email.toLowerCase();

        let merchant = await Merchant.findOne({email: data.email});
        if(merchant){
            req.session.error = "Email already in use";
            return res.redirect("/merchant/new/clover");
        }

        if(data.password.length < 15 || data.password !== data.confirmPassword){
            req.session.error = "Passwords must match and contain at least 15 characters";
            return res.redirect("/");
        }

        axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${req.session.posId}?access_token=${token}`)
            .then((cloverMerchant)=>{
                req.session.posId = undefined;

                let salt = bcrypt.genSaltSync(10);
                let hash = bcrypt.hashSync(data.password, salt);

                let merchant = new Merchant({
                    name: cloverMerchant.data.name,
                    email: data.email,
                    password: hash,
                    pos: "clover",
                    posId: cloverMerchant.data.id
                });

                for(let item of data.inventory){
                    merchant.inventory.push({
                        ingredient: item.ingredient.id,
                        quantity: item.quantity
                    });
                }

                for(let recipe of data.recipes){
                    recipe.merchant = merchant._id;
                }

                Recipe.create(data.recipes)
                    .then((recipes)=>{
                        for(let recipe of recipes){
                            merchant.recipes.push(recipe._id);
                        }

                        merchant.save()
                            .then((merchant)=>{
                                req.session.user = merchant._id;
                                return res.redirect("/inventory");
                            })
                            .catch((err)=>{
                                let errorMessage = "There was an error and your account could not be created";
                                let error = new Error({
                                    code: 547,
                                    displayMessage: errorMessage,
                                    error: err
                                });
                                error.save();

                                return;
                            });
                    })
                    .catch((err)=>{
                        let errorMessage = "There was an error and your recipes could not be saved";
                        let error = new Error({
                            code: 547,
                            displaymessage: errorMessage,
                            error: err
                        });
                        error.save();

                        return;
                    });
            })
            .catch((err)=>{
                let errorMessage = "Unable to retrieve your data from Clover";
                let error = new Error({
                    code: 111,
                    displayMessage: errorMessage,
                    error: err
                });
                error.save();

                return;
            });
    },

    //POST - Creates a non-pos merchant from all entered data
    //Inputs:
    //  req.body.data: All data from frontend in form of merchant model
    //Redirects to "/inventory"
    createMerchantNone: async function(req, res){
        let data = JSON.parse(req.body.data);
        data.email = data.email.toLowerCase();

        let merchantExists = await Merchant.findOne({email: data.email});
        if(merchantExists){
            req.session.error = "Email already in use";
            return res.redirect("/merchant/new/none");
        }

        if(data.password.length < 15 || data.password !== data.confirmPassword){
            req.session.error = "Passwords must match and contain at least 15 characters";
            return res.redirect("/");
        }

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(data.password, salt);
        
        let merchant = new Merchant({
            name: data.name,
            email: data.email,
            password: hash,
            pos: "none"
        });

        for(let item of data.inventory){
            merchant.inventory.push({
                ingredient: item.ingredient.id,
                quantity: item.quantity
            });
        }

        for(let recipe of data.recipes){
            recipe.merchant = merchant._id;
        }

        Recipe.create(data.recipes)
            .then((recipes)=>{
                for(let recipe of recipes){
                    merchant.recipes.push(recipe._id);
                }

                merchant.save()
                    .then((merchant)=>{
                        req.session.user = merchant._id;
                        return res.redirect("/inventory");
                    })
                    .catch((err)=>{
                        let errorMessage = "There was an error and your account could not be created";
                        let error = new Error({
                            code: 547,
                            displayMessage: errorMessage,
                            error: err
                        });
                        error.save();

                        return;
                    });
            })
            .catch((err)=>{
                let errorMessage = "There was an error while trying to save your recipes";
                let error = new Error({
                    code: 547,
                    displayMessage: errorMessage,
                    error: err
                });
                error.save();

                return;
            });
    },

    //POST - Adds an ingredient to merchant's inventory
    //Inputs:
    //  req.body: A merchant inventory item (ingredient id and quantity)
    //Returns:
    //  ingredient: Newly added ingredient
    addMerchantIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                merchant.inventory.push(req.body);
                merchant.save()
                    .then((newMerchant)=>{
                        newMerchant.populate("inventory.ingredient", (err)=>{
                            if(err){
                                let errorMessage = "Ingredient updated, page refresh required to display";
                                let error = new Error({
                                    code: 626,
                                    displayMessage: errorMessage,
                                    error: err
                                });
                                error.save();

                                return res.json(errorMessage);
                            }else{
                                let newIngredient = newMerchant.inventory.find(i => i.ingredient._id.toString() === req.body.ingredient);
                                return res.json(newIngredient);
                            }
                        });
                    })
                    .catch((err)=>{
                        let errorMessage = "Unable to save new ingredient";
                        let error = new Error({
                            code: 547,
                            displayMessage: errorMessage,
                            error: err
                        });
                        error.save();
                        console.log(err);

                        return res.json(errorMessage);
                    });
            })
            .catch((err)=>{
                let errorMessage = "Unable to retrieve merchant data";
                let error = new Error({
                    code: 547,
                    displayMessage: errorMessage,
                    error: err
                });
                error.save();
                console.log("error2");

                return res.json(errorMessage);
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
                    if(req.body.ingredientId === merchant.inventory[i]._id.toString()){
                        merchant.inventory.splice(i, 1);
                        break;
                    }
                }

                merchant.save()
                    .then((merchant)=>{
                        return res.json(req.body);
                    })
                    .catch((err)=>{
                        let errorMessage = "Unable to update ingredients";
                        let error = new Error({
                            code: 547,
                            displayMessage: errorMessage,
                            error: err
                        });
                        error.save();

                        return res.json(errorMessage);
                    });
            })
            .catch((err)=>{
                let errorMessage = "Unable to retrieve merchant data";
                let error = new Error({
                    code: 626,
                    displayMessage: errorMessage,
                    error: err
                });
                error.save();

                return res.json(errorMessage);
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
                updateIngredient.quantity += req.body.quantityChange;
                merchant.save()
                    .then((merchant)=>{
                        res.json(req.body.quantityChange);
                    })
                    .catch((err)=>{
                        let errorMessage = "Error: your data could not be saved";
                        let error = new Error({
                            code: 547,
                            displayMessage: errorMessage,
                            error: err
                        });
                        error.save();

                        return res.json(errorMessage);
                    })
            })
            .catch((err)=>{
                let errorMessage = "Error: your data could not be retrieved";
                let error = new Error({
                    code: 626,
                    displayMessage: errorMessage,
                    error: err
                });
                error.save();

                return res.json(errorMessage);
            });

        let invAdj = new InventoryAdjustment({
            date: Date.now(),
            merchant: req.session.user,
            ingredient: req.body.ingredientId,
            quantity: req.body.quantityChange
        });

        invAdj.save()
            .catch((err)=>{
                let error = new Error({
                    code: 547,
                    displayMessage: "none",
                    error: err
                });
                error.save();
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
                                let errorMessage = "Error: could not retrieve ingredients.  Please refresh page to see changes";
                                let error = new Error({
                                    code: 626,
                                    displayMessage: errorMessage,
                                    error: err
                                });
                                error.save();

                                return res.json(errorMessage);
                            }
                            return res.json(recipe);
                        })
                    })
                    .catch((err)=>{
                        let errorMessage = "There was an error and the recipe could not be updated";
                        let error = new Error({
                            code: 547,
                            displayMessage: errorMessage,
                            error: err
                        });
                        error.save();

                        return res.json(errorMessage);
                    });
            })
            .catch((err)=>{
                let errorMessage = "There was an error and the recipe could not be updated"
                let error = new Error({
                    code: 626,
                    displayMessage: errorMessage,
                    error: err
                });
                error.save();

                return res.json(errorMessage);
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
                        ingredient.quantity = req.body.ingredient.quantity;
                        recipe.save()
                            .then((recipe)=>{
                                return res.json({});
                            })
                            .catch((err)=>{
                                let errorMessage = "There was an error and the recipe could not be updated";
                                let error = new Error({
                                    code: 547,
                                    displayMessage: errorMessage,
                                    error: err
                                });
                                error.save();
                
                                return res.json(errorMessage);
                            });
                    }
                }
            })
            .catch((err)=>{
                let errorMessage = "There was an error and the recipe could not be updated";
                let error = new Error({
                    code: 626,
                    displayMessage: errorMessage,
                    error: err
                });
                error.save();

                return res.json(errorMessage);
            });
    },

    //POST - Remove an ingredient from a recipe
    //Inputs:
    //  req.body.ingredientId: Id of ingredient to be removed
    //  req.body.recipeId: Id of recipe to remove ingredient from
    //Returns: Nothing
    removeRecipeIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Recipe.findOne({_id: req.body.recipeId})
            .then((recipe)=>{
                for(let i = 0; i < recipe.ingredients.length; i++){
                    if(recipe.ingredients[i]._id.toString() === req.body.ingredientId){
                        recipe.ingredients.splice(i, 1);
                    }
                }

                recipe.save()
                    .then((recipe)=>{
                        return res.json({});
                    })
                    .catch((err)=>{
                        let errorMessage = "There was an error and the ingredient could not be remove from the recipe";
                        let error = new Error({
                            code: 547,
                            displayMessage: errorMessage,
                            error: err
                        });
                        error.save();
        
                        return res.json(errorMessage);
                    });
            })
            .catch((err)=>{
                let errorMessage = "There was an error and the ingredient could not be removed from the recipe";
                let error = new Error({
                    code: 626,
                    displayMessage: errorMessage,
                    error: err
                });
                error.save();

                return res.json(errorMessage);
            });
    }
}