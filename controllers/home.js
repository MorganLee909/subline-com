const axios = require("axios");

const Merchant = require("../models/merchant");
const Ingredient = require("../models/ingredient");

// const merchantId = "HCVKASXH94531";
// const token = "f1c88a69-e3e4-059a-da06-8858d0636e82";

const merchantId = "YHVPCQMVB1P81";
const token = "b48068eb-411a-918e-ea64-52007147e42c";

module.exports = {
    displayInventory: function(req, res){
        Merchant.findOne({posId: merchantId})
            .populate("inventory.ingredient")
            .then((merchant)=>{
                if(merchant){
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
                                    return res.render("inventory/inventory", {merchant: updatedMerchant});
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

    merchantSetup: function(req, res){
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
            })
    },

    updateMerchant: function(req, res){
        Merchant.updateOne({_id: req.body._id}, req.body)
            .then((merchant)=>{
                return res.json(merchant);
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    getCloverRecipes: function(req, res){
        axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchantId}/items?access_token=${token}`)
            .then((recipes)=>{
                return res.json(recipes);
            })
            .catch((err)=>{
                return res.json(err);
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

                for(let recipe of data.recipes){
                    newMerchant.recipes.push(recipe);
                }

                newMerchant.save()
                    .then((newMerchant)=>{
                        return res.redirect("/");
                    })
                    .catch((err)=>{
                        console.log(err);
                        return res.render("error");
                    })
            })
            .catch((err)=>{
                console.log(err);
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
        Ingredient.create(req.body.ingredient.ingredient)
            .then((ingredient)=>{
                Merchant.findOne({_id: req.body.merchantId})
                    .then((merchant)=>{
                        let item = {
                            ingredient: ingredient,
                            quantity: req.body.ingredient.quantity
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

    displayRecipes: function(req, res){
        Merchant.findOne({posId: merchantId})
            .populate("recipes.ingredients.ingredient")
            .populate("inventory.ingredient")
            .then((merchant)=>{
                return res.render("recipesPage/recipes", {merchant: merchant});
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    deleteRecipeIngredient: function(req, res){
        Recipe.findOne({_id: req.body.recipeId})
            .populate("ingredients.id")
            .then((recipe)=>{
                for(let i = 0; i < recipe.ingredients.length; i++){
                    if(recipe.ingredients[i]._id.toString() === req.body.ingredientId){
                        recipe.ingredients.splice(i, 1);
                        break;
                    }   
                }

                recipe.save()
                    .then((recipe)=>{
                        return res.json(recipe);
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

    updateRecipes: function(req, res){
        Merchant.findOne({posId: merchantId})
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

                        for(let recipe of result.data.elements){
                            merchant.recipes.push({
                                posId: recipe.id,
                                name: recipe.name,
                                ingredients: []
                            });
                        }
                        
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

    addMerchantIngredient: function(req, res){
        Merchant.findOne({_id: req.body.merchantId})
            .then((merchant)=>{
                merchant.inventory.push(req.body.ingredient);
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

    addRecipeIngredient: function(req, res){
        Merchant.findOne({_id: req.body.merchantId})
            .then((merchant)=>{
                let recipe = merchant.recipes.find(r => r._id.toString() === req.body.recipeId);
                recipe.ingredients.push(req.body.item)
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
    }
}