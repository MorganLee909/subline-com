const axios = require("axios");
const bcrypt = require("bcryptjs");

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
            return res.render("error");
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
                                console.log(err);
                                return res.render("error");
                            });

                        merchant.save()
                            .then((newMerchant)=>{
                                newMerchant.populate("recipes.ingredients.ingredient").execPopulate()
                                    .then((newestMerchant)=>{
                                        merchant.password = undefined;
                                        return res.json({merchant: newestMerchant, count: result.data.elements.length});
                                    })
                                    .catch((err)=>{
                                        console.log(err);
                                        return res.render("error");
                                    });
                            })
                            .catch((err)=>{
                                console.log(err);
                                return res.render("error");
                            });
                    })
                    .catch((err)=>{
                        console.log(err);
                        return res.render("error");
                    });
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    //POST - Creates a Clover merchant from all entered data
    //Inputs:
    //  req.body.data: All data from frontend in form of merchant model
    //Redirect to "/inventory"
    createMerchantClover: function(req, res){
        let data = JSON.parse(req.body.data);
        data.email = data.email.toLowerCase();

        if(data.password.length < 15 || data.password !== data.confirmPassword){
            return res.render("error");
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
                                console.log(err);
                                return res.render("error");
                            });
                    })
                    .catch((err)=>{
                        console.log(err);
                        return res.render("error");
                    });
            })
            .catch((err)=>{
                console.log(err);
            });
    },

    //POST - Creates a non-pos merchant from all entered data
    //Inputs:
    //  req.body.data: All data from frontend in form of merchant model
    //Redirects to "/inventory"
    createMerchantNone: function(req, res){
        let data = JSON.parse(req.body.data);
        data.email = data.email.toLowerCase();

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
                        console.log(err);
                        return res.render("error");
                    });
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    //POST - Adds an ingredient to merchant's inventory
    //Inputs:
    //  req.body: A merchant inventory item (ingredient id and quantity)
    //Returns:
    //  ingredient: Newly added ingredient
    addMerchantIngredient: function(req, res){
        if(!req.session.user){
            return res.render("error");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                merchant.inventory.push(req.body);
                merchant.save()
                    .then((newMerchant)=>{
                        Ingredient.findOne({_id: req.body.ingredient})
                            .then((ingredient)=>{
                                return res.json(ingredient);
                            })
                            .catch((err)=>{
                                console.log(err);
                                return res.render("error");
                            });
                    })
                    .catch((err)=>{
                        console.log(err);
                        return res.render("error");
                    });
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    //POST - Removes an ingredient from the merchant's inventory
    //Inputs: 
    //  ingredientId: id of ingredient to remove
    //Returns: Nothing
    removeMerchantIngredient: function(req, res){
        if(!req.session.user){
            return res.render("error");
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
                    .then(()=>{
                        return res.json();
                    })
                    .catch((err)=>{
                        console.log(err);
                        return res.render("error");
                    });
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    //POST - Update the quantity for a merchant inventory item
    //Inputs:
    //  req.body.ingredientId: Id of ingredient to update
    //  req.body.quantityChange: Amount to change ingredient (not the new value)
    //Returns: Nothing
    updateMerchantIngredient: function(req, res){
        if(!req.session.user){
            return res.render("error");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                let updateIngredient = merchant.inventory.find(i => i._id.toString() === req.body.ingredientId);
                updateIngredient.quantity += req.body.quantityChange;
                merchant.save()
                    .then((merchant)=>{
                        res.json();
                    })
                    .catch((err)=>{
                        console.log(err);
                        return res.render("error");
                    })
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });

        let invAdj = new InventoryAdjustment({
            date: Date.now(),
            merchant: req.session.user,
            ingredient: req.body.ingredientId,
            quantity: req.body.quantityChange
        });

        invAdj.save()
            .then((newAdjustment)=>{
                return;
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    //POST - Adds an ingredient to a recipe
    //Inputs:
    //  req.body.recipeId: Id of recipe to change
    //  req.body.item:  Ingredient to add with a quantity
    //Returns: Nothing
    addRecipeIngredient: function(req, res){
        if(!req.session.user){
            return res.render("error");
        }

        Recipe.findOne({_id: req.body.recipeId})
            .then((recipe)=>{
                recipe.ingredients.push({
                    ingredient: req.body.item.ingredient,
                    quantity: req.body.item.quantity
                });
                
                recipe.save()
                    .then((recipe)=>{
                        return res.json();
                    })
                    .catch((err)=>{
                        console.log(err);
                        return res.render("error");
                    });
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    //POST - Change quantity of a recipe's ingredient
    //Inputs:
    //  req.body.recipeId: Id of recipe containing the ingredient
    //  req.body.ingredient: The ingredient to update (_id and quantity)
    //Returns: Nothing
    updateRecipeIngredient: function(req, res){
        if(!req.session.user){
            return res.render("error");
        }

        Recipe.findOne({_id: req.body.recipeId})
            .then((recipe)=>{
                for(let ingredient of recipe.ingredients){
                    if(ingredient._id.toString() === req.body.ingredient._id){
                        ingredient.quantity = req.body.ingredient.quantity;
                        recipe.save()
                            .then((recipe)=>{
                                return res.json();
                            })
                            .catch((err)=>{
                                console.log(err);
                                return res.render("error");
                            });
                    }
                }
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    //POST - Remove an ingredient from a recipe
    //Inputs:
    //  req.body.ingredientId: Id of ingredient to be removed
    //  req.body.recipeId: Id of recipe to remove ingredient from
    //Returns: Nothing
    removeRecipeIngredient: function(req, res){
        if(!req.session.user){
            return res.render("error");
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
                        return res.json();
                    })
                    .catch((err)=>{
                        console.log(err);
                        return res.render("error");
                    });
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },
}