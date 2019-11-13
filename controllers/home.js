const axios = require("axios");

const Merchant = require("../models/merchant");
const Ingredient = require("../models/ingredient");
const Recipe = require("../models/recipe");

// const merchantId = "HCVKASXH94531";
// const token = "f1c88a69-e3e4-059a-da06-8858d0636e82";

const merchantId = "YHVPCQMVB1P81";
const token = "b48068eb-411a-918e-ea64-52007147e42c";

module.exports = {
    landingPage: function(req, res){
        return res.render("landingPage/landing");
    },

    displayInventory: function(req, res){
        Merchant.findOne({posId: merchantId})
            .populate("inventory.ingredient")
            .populate("recipes")
            .then((merchant)=>{
                if(merchant){
                    req.session.user = merchant._id;
                    axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchant.posId}/orders?filter=clientCreatedTime>=${merchant.lastUpdatedTime}&expand=lineItems&access_token=${token}`)
                        .then((result)=>{
                            for(let order of result.data.elements){
                                for(let item of order.lineItems.elements){
                                    let recipe = merchant.recipes.find(r => r.posId === item.item.id);
                                    if(recipe){
                                        for(let ingredient of recipe.ingredients){
                                            let inventoryIngredient = {};
                                            for(let invItem of merchant.inventory){
                                                if(invItem.ingredient._id.toString() === ingredient.ingredient.toString()){
                                                    inventoryIngredient = invItem;
                                                }
                                            }
                                            inventoryIngredient.quantity -= ingredient.quantity;
                                        }
                                    }
                                }
                            }
                            merchant.lastUpdatedTime = Date.now();

                            merchant.save()
                                .then((updatedMerchant)=>{
                                    return res.render("inventoryPage/inventory", {merchant: updatedMerchant});
                                })
                                .catch((err)=>{
                                    console.log(err);
                                    return res.render("error");
                                });
                        })
                        .catch((err)=>{
                            console.log(err);
                        });
                }else{
                    return res.redirect("/merchant/new");
                }
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    //Display page to set up new merchant with Clover POS
    //TODO: This is for development, needs updating for production
    merchantSetupClover: function(req, res){
        Ingredient.find()
            .then((ingredients)=>{
                axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchantId}/items?access_token=${token}`)
                    .then((recipes)=>{
                        return res.render("merchantSetupPage/merchantSetup", {ingredients: ingredients, recipes: recipes.data});
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

    //Display page to set up merchant with no POS system
    merchantSetupNone: function(req, res){
        Ingredient.find()
            .then((ingredients)=>{
                return res.render("merchantSetupPage/merchantSetup", {ingredients: ingredients});
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    displayRecipes: function(req, res){
        if(!req.session.user){
            return res.render("error");
        }

        Merchant.findOne({_id: req.session.user})
            .populate({
                path: "recipes",
                model: "Recipe",
                populate: {
                    path: "ingredients.ingredient",
                    model: "Ingredient"
                }
            })
            .populate("inventory.ingredient")
            .then((merchant)=>{
                return res.render("recipesPage/recipes", {merchant: merchant});
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    updateRecipes: function(req, res){
        if(!req.session.user){
            return res.render("error");
        }

        Merchant.findOne({_id: req.session.user})
            .populate("recipes")
            .then((merchant)=>{
                axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchantId}/items?access_token=${token}`)
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

    createMerchant: function(req, res){
        let data = JSON.parse(req.body.data);

        axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchantId}?access_token=${token}`)
            .then((merchant)=>{
                let newMerchant = new Merchant({
                    name: merchant.data.name,
                    posId: merchant.data.id,
                    lastUpdatedTime: Date.now(),
                    inventory: [],
                    recipes: []
                });

                for(let ingredient of data.ingredients){
                    let newIngredient = {
                        ingredient: ingredient.id,
                        quantity: parseInt(ingredient.quantity)
                    }
                    newMerchant.inventory.push(newIngredient);
                }

                let newRecipes = []
                for(let recipe of data.recipes){
                    let newRecipe = {
                        posId: recipe.posId,
                        merchant: newMerchant._id,
                        name: recipe.name,
                        ingredients: []
                    };
                    for(let ingredient of recipe.ingredients){
                        newRecipe.ingredients.push(ingredient);
                    }
                    newRecipes.push(newRecipe);
                }

                Recipe.create(newRecipes)
                    .then((recipes)=>{
                        for(let recipe of recipes){
                            newMerchant.recipes.push(recipe);
                        }
                        newMerchant.save()
                                .then((merchant)=>{
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

    addMerchantIngredient: function(req, res){
        if(!req.session.user){
            return res.render("error");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                merchant.inventory.push(req.body);
                merchant.save()
                    .then((newMerchant)=>{
                        return res.json(newMerchant);
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

    updateMerchantIngredient: function(req, res){
        if(!req.session.user){
            return res.render("error");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                let updateIngredient = merchant.inventory.find(i => i._id.toString() === req.body.ingredientId);
                updateIngredient.quantity = req.body.quantity;
                merchant.save()
                    .then((merchant)=>{
                        return res.json();
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
    },

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
                            })
                    }
                }
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

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

    getIngredients: function(req, res){
        Ingredient.find()
            .then((ingredients)=>{
                return res.json(ingredients);
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    createNewIngredients: function(req, res){
        Ingredient.create(req.body)
            .then((ingredients)=>{
                return res.json(ingredients);
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    createIngredient: function(req, res){
        Ingredient.create(req.body.ingredient)
            .then((ingredient)=>{
                Merchant.findOne({_id: req.session.user})
                    .then((merchant)=>{
                        let item = {
                            ingredient: ingredient,
                            quantity: req.body.quantity
                        }
                        merchant.inventory.push(item);
                        merchant.save()
                            .then((merchant)=>{
                                console.log("something");
                                return res.json(merchant);
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

    getCloverRecipes: function(req, res){
        if(!req.session.user){
            return res.render("error");
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchant.posId}/items?access_token=${token}`)
                    .then((recipes)=>{
                        return res.json(recipes);
                    })
                    .catch((err)=>{
                        return res.json(err);
                    });
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    unregistered: function(req, res){
        return res.redirect("/");
    }
}