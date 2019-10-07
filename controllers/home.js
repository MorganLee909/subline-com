const axios = require("axios");

const Merchant = require("../models/merchant");
const Ingredient = require("../models/ingredient");
const Recipe = require("../models/recipe");

// const merchantId = "HCVKASXH94531";
// const token = "f1c88a69-e3e4-059a-da06-8858d0636e82";

const merchantId = "YHVPCQMVB1P81";
const token = "b48068eb-411a-918e-ea64-52007147e42c";

module.exports = {
    displayInventory: (req, res)=>{
        Merchant.findOne({cloverId: merchantId})
            .populate("inventory.ingredient")
            .populate("recipes")
            .then((merchant)=>{
                if(merchant){
                    axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchant.cloverId}/orders?filter=clientCreatedTime>=${merchant.lastUpdatedTime}&expand=lineItems&access_token=${token}`)
                        .then((result)=>{
                            for(let order of result.data.elements){
                                for(let item of order.lineItems.elements){
                                    let recipe = merchant.recipes.find(r => r.cloverId === item.item.id);
                                    if(recipe){
                                        for(let ingredient of recipe.ingredients){
                                            let inventoryIngredient = {};
                                            for(let invItem of merchant.inventory){
                                                if(invItem.ingredient._id.toString() === ingredient.id.toString()){
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

    merchantSetup: (req, res)=>{
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

    getRecipes: (req, res)=>{
        axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchantId}/items?access_token=${token}`)
            .then((recipes)=>{
                return res.json(recipes);
            })
            .catch((err)=>{
                return res.json(err);
            });
    },

    createMerchant: (req, res)=>{
        let data = JSON.parse(req.body.data);

        Recipe.create(data.recipes)
            .then((recipes)=>{
                axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${merchantId}?access_token=${token}`)
                    .then((merchant)=>{
                        let newMerchant = new Merchant({
                            name: merchant.data.name,
                            cloverId: merchant.data.id,
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

                        for(let recipe of recipes){
                            newMerchant.recipes.push(recipe._id);
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
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    createNewIngredients: (req, res)=>{
        Ingredient.create(req.body)
            .then((ingredients)=>{
                return res.json(ingredients);
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    updateIngredient: (req, res)=>{
        Merchant.findOne({cloverId: merchantId})
            .then((merchant)=>{
                for(let item of merchant.inventory){
                    if(req.body.id === item.ingredient.toString()){
                        item.quantity = req.body.quantity;
                        break;
                    }
                }
                merchant.save()
                    .then((updatedMerchant)=>{
                        return res.json(updatedMerchant);
                    })
                    .catch((err)=>{
                        console.log(err);
                        return res.json(err);
                    })
            })
            .catch((err)=>{
                console.log(err);
                return res.render("error");
            });
    },

    removeIngredient: (req, res)=>{
        console.log(req.body);
        Merchant.findOne({cloverId: merchantId})
            .then((merchant)=>{
                for(let i = 0; i < merchant.inventory.length; i++){
                    console.log(`${req.body.id} ${merchant.inventory[i].ingredient.toString()}`);
                    if(req.body.id === merchant.inventory[i].ingredient.toString()){
                        merchant.inventory.splice(i, 1);
                    }
                }

                merchant.save()
                    .then((merchant)=>{
                        return res.json(merchant);
                    })
                    .catch((err)=>{
                        console.log(err);
                        return res.json(err);
                    });
            })
            .catch((err)=>{
                console.log(err);
                return res.json(err);
            });
    }
}