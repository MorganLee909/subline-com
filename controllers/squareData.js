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
                
                let recipes = helper.createRecipesFromSquare(response[0].data.objects, merchant._id);
                merchant.recipes = recipes;
    
                return Promise.all([Recipe.create(recipes), owner.save(), merchant.save()]);
            })
            .then((response)=>{
                req.session.owner = response[1].session.sessionId;
                req.session.merchant = merchant._id;
    
                res.redirect("/dashboard");

                helper.getAllMerchantTransactions(merchant, owner.square.accessToken);
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
        let ownerLocation = res.locals.owner.populate("merchants", "locationId").execPopulate();

        let locations = axios.get(`${process.env.SQUARE_ADDRESS}/v2/locations`, {
            headers: {
                "Authorization": `Bearer ${res.locals.owner.square.accessToken}`,
                "Content-Type": "application/json"
            }
        });

        Promise.all([ownerLocation, locations])
            .then((response)=>{
                let checkLocations = [];
                let locations = [];

                for(let i = 0; i < res.locals.owner.merchants.length; i++){
                    checkLocations.push(res.locals.owner.merchants[i].locationId);
                }
                
                for(let i = 0; i < response[1].data.locations.length; i++){
                    if(checkLocations.includes(response[1].data.locations[i].id) === false){
                        locations.push({
                            name: response[1].data.locations[i].name,
                            id: response[1].data.locations[i].id
                        });
                    }
                }

                return res.json(locations);
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE LOCATION DATA FROM SQUARE");
            });
    },

    /*
    GET: create new merchant from square location and add to owner
    response = [Owner, Merchant]
    */
    addMerchant: function(req, res){
        let merchant = new Merchant({
            owner: res.locals.owner._id,
            pos: "square",
            locationId: req.params.location,
            createdAt: new Date(),
            inventory: [],
            recipes: []
        });

        res.locals.owner.merchants.push(merchant._id);

        let location = axios.get(`${process.env.SQUARE_ADDRESS}/v2/locations/${req.params.location}`, {
            headers: {
                "Authorization": `Bearer ${res.locals.owner.square.accessToken}`,
                "Content-Type": "application/json"
            }
        });

        let recipes = axios.post(`${process.env.SQUARE_ADDRESS}/v2/catalog/search`, {
            object_types: ["ITEM"]
        }, {
            headers: {
                "Authorization": `Bearer ${res.locals.owner.square.accessToken}`,
                "Content-Type": "application/json"
            }
        });

        Promise.all([location, recipes])
            .then((response)=>{
                merchant.name = response[0].data.location.name;

                let recipes = helper.createRecipesFromSquare(response[1].data.objects, merchant._id);
                merchant.recipes = recipes;

                let populateOwner = res.locals.owner.populate("merchants", "name");

                return Promise.all([Recipe.create(recipes), res.locals.owner.save(), merchant.save(), populateOwner]);
            })
            .then((response)=>{
                req.session.merchant = merchant._id;

                res.json([{
                    _id: res.locals.owner._id,
                    email: res.locals.owner.email,
                    merchants: res.locals.owner.merchants
                }, merchant]);

                helper.getAllMerchantTransactions(merchant, res.locals.owner.square.accessToken);
            })
            .catch((err)=>{
                if(err.name === "ValidationError") return req.session.err = err.errors[Object.keys(err.errors)[0]].properties.message;
                return res.json("ERROR: UNABLE TO CREATE NEW MERCHANT");
            });
    }
}