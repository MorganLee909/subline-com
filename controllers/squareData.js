const Owner = require("../models/owner.js");
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
    redirect: async function(req, res){
        if(req.body.password !== req.body.confirmPassword){
            req.session.error = "YOUR PASSWORDS DO NOT MATCH";
            return res.redirect("/");
        }
        let email = req.body.email.toLowerCase();

        let potentialOwner = await Owner.findOne({email: email})
        if(potentialOwner !== null){
            req.session.error = "USER WITH THIS EMAIL ADDRESS ALREADY EXISTS";
            return res.redirect("/login");
        }

        let expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 90);

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);

        let owner = new Owner({
            email: email,
            password: hash,
            square: {},
            createdAt: new Date(),
            status: ["unverified"],
            session: {
                sessionId: helper.generateId(25),
                expiration: expirationDate
            },
            merchants: []
        });

        let merchant = new Merchant({
            owner: owner._id,
            name: req.body.name,
            pos: "square",
            inventory: [],
            recipes: [],
            square: {},
            createdAt: new Date()
        });

        owner.merchants.push(merchant._id);

        Promise.all([owner.save(), merchant.save()])
            .then((response)=>{
                req.session.owner = response[0].session.sessionId;
                return res.redirect(`${process.env.SQUARE_ADDRESS}/oauth2/authorize?client_id=${process.env.SUBLINE_SQUARE_APPID}&scope=INVENTORY_READ+ITEMS_READ+MERCHANT_PROFILE_READ+ORDERS_READ+PAYMENTS_READ`);
            })
            .catch((err)=>{
                res.session.error = "ERROR: UNABLE TO CREATE NEW USER";
                return res.redirect("/");
            });
    },

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
        let owner = Owner.findOne({"session.sessionId": req.session.owner}).populate("merchants");
        let squareMerchant = axios.post(url, data);
        Promise.all([owner, squareMerchant])
            .then((response)=>{
                if(response[0] === null) throw "ERROR: UNABLE TO CREATE ACCOUNT";

                owner = response[0];
                merchant = response[0].merchants[0];

                owner.square = {
                    id: response[1].data.merchant_id,
                    expires: new Date(response[1].data.expires_at),
                    refreshToken: response[1].data.refresh_token,
                    accessToken: response[1].data.access_token
                };

                return axios.get(`${process.env.SQUARE_ADDRESS}/v2/merchants/${owner.square.id}`, {
                    headers: {Authorization: `Bearer ${owner.square.accessToken}`}
                });
            })    
            .then((response)=>{
                merchant.locationId = response.data.merchant.main_location_id;

                let items = axios.post(`${process.env.SQUARE_ADDRESS}/v2/catalog/search`, {
                    object_types: ["ITEM"]
                }, {
                    headers: {
                        Authorization: `Bearer ${owner.square.accessToken}`
                    }
                });

                let location = axios.get(`${process.env.SQUARE_ADDRESS}/v2/locations/${merchant.locationId}`, {
                    headers: {
                        Authorization: `Bearer ${owner.square.accessToken}`
                    }
                });

                return Promise.all([items, location]);
            })
            .then((response)=>{
                if(owner.email === response[1].data.location.business_email) merchant.status = [];
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
    
                return Promise.all([Recipe.create(recipes), owner.save(), merchant.save()]);
            })
            .then((response)=>{
                req.session.owner = response[1].session.sessionId;
                req.session.merchant = merchant._id;
    
                res.redirect("/dashboard");

                let body = {
                    location_ids: [merchant.locationId],
                    limit: 10000,
                    query: {}
                };
                let options = {
                    headers: {
                        Authorization: `Bearer ${owner.square.accessToken}`,
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
                    location_ids: [merchant.locationId],
                    limit: 10000,
                    cursor: response.data.cursor,
                    query: {}
                };
                let options = {
                    headers: {
                        Authorization: `Bearer ${owner.square.accessToken}`,
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
                        Authorization: `Bearer ${merchant.square.accessToken}`
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
    },

    /*
    GET: add another merchant to an owner with another square location
    response = [{
        name: String,
        id: String
    }]
    */
    getLocations: function(req, res){
        axios.get(`${process.env.SQUARE_ADDRESS}/v2/locations`, {
            headers: {
                "Authorization": `Bearer ${res.locals.owner.square.accessToken}`,
                "Content-Type": "application/json"
            }
        })
            .then((response)=>{
                let locations = [];
                for(let i = 0; i < response.data.locations.length; i++){
                    locations.push({
                        name: response.data.locations[i].name,
                        id: response.data.locations[i].id
                    });
                }

                return res.json(locations);
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE LOCATION DATA FROM SQUARE");
            })
    },

    /*
    GET: create new merchant from square location and add to owner
    response = [Owner, Merchant]
    */
    addMerchant: function(req, res){
        console.log("adding merchant");
        console.log(req.params);
    }
}