const axios = require("axios");
const bcrypt = require("bcryptjs");

const Merchant = require("../models/merchant");
const Ingredient = require("../models/ingredient");
const Recipe = require("../models/recipe");
const Transaction = require("../models/transaction");

const token = "b48068eb-411a-918e-ea64-52007147e42c";

module.exports = {
    landingPage: function(req, res){
        return res.render("landingPage/landing");
    },

    displayInventory: function(req, res){
        if(!req.session.user){
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .populate("inventory.ingredient")
            .populate("recipes")
            .then((merchant)=>{
                if(merchant.pos === "clover"){
                    axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchant.posId}/orders?filter=clientCreatedTime>=${merchant.lastUpdatedTime}&expand=lineItems&access_token=${token}`)
                        .then((result)=>{
                            let transactions = [];

                            for(let order of result.data.elements){
                                let newTransaction = new Transaction({
                                    merchant: merchant._id,
                                    date: new Date(order.createdTime)
                                });

                                for(let item of order.lineItems.elements){
                                    let recipe = merchant.recipes.find(r => r.posId === item.item.id);
                                    if(recipe){
                                        newTransaction.recipes.push(recipe._id);
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

                                transactions.push(newTransaction);
                            }
                            merchant.lastUpdatedTime = Date.now();

                            merchant.save()
                                .then((updatedMerchant)=>{
                                    res.render("inventoryPage/inventory", {merchant: updatedMerchant});
                                    Transaction.create(transactions);
                                    return;
                                })
                                .catch((err)=>{
                                    console.log(err);
                                    return res.render("error");
                                });
                        })
                        .catch((err)=>{
                            console.log(err);
                        });
                }else if(merchant.pos === "none"){
                    return res.render("inventoryPage/inventory", {merchant: merchant})
                }else{
                    return res.redirect("/");
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
        req.session.posId = "YHVPCQMVB1P81";
        
        Ingredient.find()
            .then((ingredients)=>{
                axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${req.session.posId}/items?access_token=${token}`)
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
                return res.render("merchantSetupPage/merchantSetup", {ingredients: ingredients, recipes: null});
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

    createMerchantClover: function(req, res){
        let data = JSON.parse(req.body.data);

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

    createMerchantNone: function(req, res){
        let data = JSON.parse(req.body.data);

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
                                return res.json(item);
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
    },

    login: function(req, res){
        Merchant.findOne({email: req.body.email})
            .then((merchant)=>{
                bcrypt.compare(req.body.password, merchant.password, (err, result)=>{
                    if(result){
                        req.session.user = merchant._id;
                        return res.redirect("/inventory");
                    }

                    console.log(err);
                    return res.redirect("/");
                });
            })
            .catch((err)=>{
                console.log(err);
                return res.redirect("/");
            });
    }
}