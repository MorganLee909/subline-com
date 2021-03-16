const Merchant = require("../models/merchant.js");
const Recipe = require("../models/recipe.js");
const Transaction = require("../models/transaction.js");

const helper = require("./helper.js");

const axios = require("axios");
const bcrypt = require("bcryptjs");

module.exports = {
    /*POST - Redirects user to Square OAuth and saves input data
    req.body = {
        name: String,
        email: String,
        password: String,
        confirmPassword: String
    }
    */
    redirect: function(req, res){
        if(req.body.password !== req.body.confirmPassword){
            req.session.error = "YOUR PASSWORDS DO NOT MATCH";
            return res.redirect("/");
        }

        let expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 90);

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);

        let merchant = new Merchant({
            name: req.body.name,
            email: req.body.email,
            password: hash,
            pos: "square",
            status: ["unverified"],
            inventory: [],
            recipes: [],
            square: {},
            createdAt: new Date(),
            session: {
                sessionId: helper.generateId(25),
                expiration: expirationDate
            }
        });

        merchant.save()
            .then((response)=>{
                req.session.user = merchant.session.sessionId;
                return res.redirect(`${process.env.SQUARE_ADDRESS}/oauth2/authorize?client_id=${process.env.SUBLINE_SQUARE_APPID}&scope=INVENTORY_READ+ITEMS_READ+MERCHANT_PROFILE_READ+ORDERS_READ+PAYMENTS_READ`);
            })
            .catch((err)=>{
                res.session.error = "ERROR: UNABLE TO CREATE NEW USER";
                return res.redirect("/");
            });
    },

    //GET: Used by square. This route is used for the authentication code
    //Redirects to either dashboard or new merchant creation
    // authorize: function(req, res){
    //     const code = req.url.slice(req.url.indexOf("code=") + 5, req.url.indexOf("&"));
    //     const url = `${process.env.SQUARE_ADDRESS}/oauth2/token`;
    //     let data = {
    //         client_id: process.env.SUBLINE_SQUARE_APPID,
    //         client_secret: process.env.SUBLINE_SQUARE_APPSECRET,
    //         grant_type: "authorization_code",
    //         code: code
    //     };
    
    //     axios.post(url, data)
    //         .then((response)=>{
    //             data = response.data;
    //             return Merchant.findOne({posId: data.merchant_id});
    //         })
    //         .then((merchant)=>{
    //             if(merchant){
    //                 merchant.posAccessToken = data.access_token;
    
    //                 return merchant.save()
    //                     .then((merchant)=>{
    //                         req.session.user = merchant.session.sessionId;
    //                         return res.redirect("/dashboard");
    //                     })
    //                     .catch((err)=>{
    //                         req.session.error = "ERROR: UNABLE TO CREATE NEW USER";
    //                         return res.redirect("/");
    //                     })
    //             }else{
    //                 req.session.merchantId = data.merchant_id;
    //                 req.session.accessToken = data.access_token;
    
    //                 return res.redirect("/merchant/create/square");
    //             }
    //         })
    //         .catch((err)=>{
    //             req.session.error = "ERROR: UNABLE TO RETRIEVE DATA FROM SQUARE";
    //             return res.redirect("/");
    //         });
    // },

    //GET: Gathers all data from square to create our merchant
    //Redirects to the dashboard
    createMerchant: function(req, res){
        let code = req.url.slice(req.url.indexOf("code=") + 5, req.url.indexOf("&"));
        let url = `${process.env.SQUARE_ADDRESS}/oauth2/token`;

        let data = {
            client_id: process.env.SUBLINE_SQUARE_APPID,
            client_secret: process.env.SUBLINE_SQUARE_APPSECRET,
            grant_type: "authorization_code",
            code: code,
        }

        let merchant = {};

        let localMerchant = Merchant.findOne({"session.sessionId": req.session.user});
        let squareMerchant = axios.post(url, data);
        Promise.all([localMerchant, squareMerchant])
            .then((response)=>{
                if(response[0] === null) throw "ERROR: UNABLE TO CREATE ACCOUNT";

                merchant = response[0];

                merchant.square = {
                    id: response[1].data.merchant_id,
                    expires: new Date(response[1].data.expires_at),
                    refreshToken: response[1].data.refresh_token,
                    accessToken: response[1].data.access_token
                };

                return axios.get(`${process.env.SQUARE_ADDRESS}/v2/merchants/${merchant.square.id}`, {
                    headers: {Authorization: `Bearer ${merchant.square.accessToken}`}
                });
            })    
            .then((response)=>{
                merchant.square.location = response.data.merchant.main_location_id;

                let items = axios.post(`${process.env.SQUARE_ADDRESS}/v2/catalog/search`, {
                    object_types: ["ITEM"]
                }, {
                    headers: {
                        Authorization: `Bearer ${merchant.square.accessToken}`
                    }
                });

                let location = axios.get(`${process.env.SQUARE_ADDRESS}/v2/locations/${merchant.square.location}`, {
                    headers: {
                        Authorization: `Bearer ${merchant.square.accessToken}`
                    }
                });

                return Promise.all([items, location]);
            })
            .then((response)=>{
                if(merchant.email === response[1].data.location.business_email) merchant.status = [];
                let recipes = [];
                
                for(let i = 0; i < response[0].data.objects.length; i++){
                    if(response[0].data.objects[i].item_data.variations.length > 1){
                        for(let j = 0; j < response[0].data.objects[i].item_data.variations.length; j++){
                            let item = response[0].data.objects[i].item_data.variations[j];
                            let price = 0;
                            if(item.item_variation_data.price_money !== undefined) price = item.item_variation_data.price_money.amount;
                            let recipe = new Recipe({
                                posId: item.id,
                                merchant: merchant._id,
                                name: `${response[0].data.objects[i].item_data.name} '${item.item_variation_data.name}'`,
                                price: price
                            });
    
                            recipes.push(recipe);
                            merchant.recipes.push(recipe);
                        }
                    }else{
                        let recipe = new Recipe({
                            posId: response[0].data.objects[i].item_data.variations[0].id,
                            merchant: merchant._id,
                            name: response[0].data.objects[i].item_data.name,
                            price: response[0].data.objects[i].item_data.variations[0].item_variation_data.price_money.amount,
                            ingredients: []
                        });
    
                        recipes.push(recipe);
                        merchant.recipes.push(recipe);
                    }
                }
    
                return Promise.all([Recipe.create(recipes), merchant.save()]);
            })
            .then((response)=>{
                req.session.user = response[1].session.sessionId;
    
                res.redirect("/dashboard");

                let body = {
                    location_ids: [merchant.square.location],
                    limit: 10000,
                    query: {}
                };
                let options = {
                    headers: {
                        Authorization: `Bearer ${merchant.square.accessToken}`,
                        "Content-Type": "application/json"
                    }
                };
                return axios.post(`${process.env.SQUARE_ADDRESS}/v2/orders/search`, body, options);
            })
            .then(async (response)=>{
                let transactions = [];

                for(let i = 0; i < response.data.orders.length; i++){
                    let transaction = new Transaction({
                        merchant: merchant._id,
                        date: new Date(response.data.orders[i].created_at),
                        posId: response.data.orders[i].id,
                        recipes: []
                    });

                    if(response.data.orders[i].line_items === undefined) continue;
                    for(let j = 0; j < response.data.orders[i].line_items.length; j++){
                        let item = response.data.orders[i].line_items[j];

                        for(let k = 0; k < merchant.recipes.length; k++){
                            if(merchant.recipes[k].posId === item.catalog_object_id){
                                transaction.recipes.push({
                                    recipe: merchant.recipes[k]._id,
                                    quantity: parseInt(item.quantity)
                                });
                            }
                        }
                    }

                    transactions.push(transaction);
                }

                let body = {
                    location_ids: [merchant.square.location],
                    limit: 10000,
                    cursor: response.data.cursor,
                    query: {}
                };
                let options = {
                    headers: {
                        Authorization: `Bearer ${merchant.square.accessToken}`,
                        "Content-Type": "application/json"
                    }
                };

                while(body.cursor !== undefined){
                    let response = await axios.post(`${process.env.SQUARE_ADDRESS}/v2/orders/search`, body, options);
                    body.cursor = response.data.cursor;
                    
                    for(let i = 0; i < response.data.orders.length; i++){
                        let transaction = new Transaction({
                            merchant: merchant._id,
                            date: new Date(response.data.orders[i].created_at),
                            posId: response.data.orders[i].id,
                            recipes: []
                        });
    
                        if(responose.data.orders[i].line_items === undefined) continue;
                        for(let j = 0; j < response.data.orders[i].line_items.length; j++){
                            let item = response.data.orders[i].line_items[j];
    
                            for(let k = 0; k < merchant.recipes.length; k++){
                                if(merchant.recipes[k].posId === item.catalog_object_id){
                                    transaction.recipes.push({
                                        recipe: merchant.recipes[k]._id,
                                        quantity: parseInt(item.quantity)
                                    });
                                }
                            }
                        }
    
                        transactions.push(transaction);
                    }
                }

                return Transaction.create(transactions);
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    req.session.error = err;
                }else if(err.name === "ValidationError"){
                    req.session.error = err.errors[Object.keys(err.errors)[0]].properties.message;
                }else{
                    req.session.error = "ERROR: UNABLE TO CREATE NEW USER";
                }
                return res.redirect("/");
            });
    },

    updateRecipes: function(req, res){
        let merchant = {};
        let merchantRecipes = [];
        let newRecipes = [];
    
        res.locals.merchant
            .populate("recipes")
            .execPopulate()
            .then((fetchedMerchant)=>{
                merchant = fetchedMerchant;
                return axios.post(`${process.env.SQUARE_ADDRESS}/v2/catalog/search`, {
                    object_types: ["ITEM"]
                }, {
                    headers: {
                        Authorization: `Bearer ${merchant.posAccessToken}`
                    }
                });
            })
            .then((response)=>{
                merchantRecipes = merchant.recipes.slice();
    
                
                for(let i = 0; i < response.data.objects.length; i++){
                    let itemData = response.data.objects[i].item_data;
                    for(let j = 0; j < itemData.variations.length; j++){
                        let isFound = false;
    
                        for(let k = 0; k < merchantRecipes.length; k++){
                            if(itemData.variations[j].id === merchantRecipes[k].posId){
                                merchantRecipes.splice(k, 1);
                                k--;
                                isFound = true;
                                break;
                            }
                        }
    
                        if(!isFound){
                            let newRecipe = new Recipe({
                                posId: itemData.variations[j].id,
                                merchant: merchant._id,
                                name: "",
                                price: itemData.variations[j].item_variation_data.price_money.amount,
                                ingredients: []
                            });
    
                            if(itemData.variations.length > 1){
                                newRecipe.name = `${itemData.name} '${itemData.variations[j].item_variation_data.name}'`;
                            }else{
                                newRecipe.name = itemData.name;
                            }
    
                            newRecipes.push(newRecipe);
                            merchant.recipes.push(newRecipe);
                        }
                    }
                }
    
                let ids = [];
                for(let i = 0; i < merchantRecipes.length; i++){
                    ids.push(merchantRecipes[i]._id);
                    for(let j = 0; j < merchant.recipes.length; j++){
                        if(merchantRecipes[i]._id.toString() === merchant.recipes[j]._id.toString()){
                            merchant.recipes.splice(j, 1);
                            j--;
                            break;
                        }
                    }
                }
    
                if(newRecipes.length > 0) Recipe.create(newRecipes);
                if(merchantRecipes.length > 0) Recipe.deleteMany({_id: {$in: ids}});    

                return merchant.save();
            })
            .then((merchant)=>{
                return res.json({new: newRecipes, removed: merchantRecipes});
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO RETRIEVE RECIPE DATA FROM SQUARE");
            });
    }
}