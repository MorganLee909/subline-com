const Owner = require("../models/owner.js");
const Merchant = require("../models/merchant.js");
const Recipe = require("../models/recipe.js");

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
            name: req.body.name,
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
                req.session.error = "ERROR: UNABLE TO CREATE NEW USER";
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
        };

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
                owner.name = response.data.merchant.business_name;

                let items = axios.post(`${process.env.SQUARE_ADDRESS}/v2/catalog/search-catalog-items`, {
                    enabled_location_ids: [merchant.locationId]
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

                let categories = axios.post(`${process.env.SQUARE_ADDRESS}/v2/catalog/search`, {
                    object_types: ["CATEGORY"],
                },{
                    headers: {
                        Authorization: `Bearer ${owner.square.accessToken}`
                    }
                });

                return Promise.all([items, location, categories]);
            })
            .then((response)=>{
                let location = response[1].data.location;
                if(owner.email === location.business_email.toLowerCase()) owner.status = [];
                merchant.name = location.name;

                let recipes = helper.createRecipesFromSquare(response[0].data.items, response[2].data.objects, merchant._id);
                merchant.recipes = recipes;

                let baseUrl = "https://api.geocod.io/v1.6/geocode/";
                let address = location.address;
                let geocode = axios.get(`${baseUrl}?q=${address.address_line_1}+${address.locality}+${address.administrative_district_level_1}+${address.postal_code}&api_key=${process.env.SUBLINE_GEOCODE_API}&limit=1`);
    
                return Promise.all([Recipe.create(recipes), geocode, owner.save()]);
            })
            .then((response)=>{
                let addressData = response[1].data.results[0];

                merchant.address = {
                    full: response[1].data.results[0].address_components.formatted_address,
                    city: addressData.address_components.city,
                    state: addressData.address_components.state,
                    zip: addressData.address_components.zip
                };

                merchant.location = {
                    type: "Point",
                    coordinates: [addressData.location.lat, addressData.location.lng]
                };

                return merchant.save();
            })
            .then((response)=>{
                req.session.owner = owner.session.sessionId;
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
                Merchant.deleteOne({_id: merchant._id});
                Owner.deleteOne({_id: owner._id});
                return res.redirect("/");
            });
    },

    updateRecipes: function(req, res){
        let merchantRecipes = [];
        let newRecipes = [];

        let populate = res.locals.merchant.populate("recipes").execPopulate();

        let squareRecipes = axios.post(`${process.env.SQUARE_ADDRESS}/v2/catalog/search-catalog-items`, {
                enabled_location_ids: [res.locals.merchant.locationId]
            }, {
                headers: {
                    Authorization: `Bearer ${res.locals.owner.square.accessToken}`
                }
            });

        let categories = axios.post(`${process.env.SQUARE_ADDRESS}/v2/catalog/search`, {
            object_types: ["CATEGORY"]
        },{
            headers: {
                Authorization: `Bearer ${res.locals.owner.square.accessToken}`
            }
        })
    
        Promise.all([populate, squareRecipes, categories])
            .then((response)=>{
                merchantRecipes = res.locals.merchant.recipes.slice();
    
                for(let i = 0; i < response[1].data.items.length; i++){
                    let itemData = response[1].data.items[i].item_data;
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
    
                        if(isFound === false){
                            let priceMoney = itemData.variations[j].item_variation_data.price_money;
                            let price = (priceMoney === undefined) ? 0 : priceMoney.amount;

                            let newRecipe = new Recipe({
                                posId: itemData.variations[j].id,
                                merchant: res.locals.merchant._id,
                                name: "",
                                price: price,
                                ingredients: [],
                                category: ""
                            });
    
                            if(itemData.variations.length > 1){
                                newRecipe.name = `${itemData.name} '${itemData.variations[j].item_variation_data.name}'`;
                            }else{
                                newRecipe.name = itemData.name;
                            }
                            
                            for(let k = 0; k < response[2].data.objects.length; k++){
                                if(itemData.category_id === response[2].data.objects[k].id){
                                    newRecipe.category = response[2].data.objects[k].category_data.name;
                                    break;
                                }
                            }
    
                            newRecipes.push(newRecipe);
                            res.locals.merchant.recipes.push(newRecipe);
                        }
                    }
                }
    
                let ids = [];
                for(let i = 0; i < merchantRecipes.length; i++){
                    ids.push(merchantRecipes[i]._id);
                    for(let j = 0; j < res.locals.merchant.recipes.length; j++){
                        if(merchantRecipes[i]._id.toString() === res.locals.merchant.recipes[j]._id.toString()){
                            res.locals.merchant.recipes.splice(j, 1);
                            j--;
                            break;
                        }
                    }
                }
    
                if(newRecipes.length > 0) Recipe.create(newRecipes);

                return res.locals.merchant.save();
            })
            .then((merchant)=>{
                return res.json({new: newRecipes, removed: merchantRecipes});
            })
            .catch((err)=>{
                if(typeof(err) === "string") return res.json(err);
                if(err.name === "ValidationError") return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
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
    req.params.location = location.id
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

        let recipes = axios.post(`${process.env.SQUARE_ADDRESS}/v2/catalog/search-catalog-items`, {
            enabled_location_ids: [req.params.location]
        }, {
            headers: {
                Authorization: `Bearer ${res.locals.owner.square.accessToken}`,
                "Content-Type": "application/json"
            }
        });

        Promise.all([location, recipes])
            .then((response)=>{
                merchant.name = response[0].data.location.name;

                let recipes = helper.createRecipesFromSquare(response[1].data.items, merchant._id);
                merchant.recipes = recipes;

                let populateOwner = res.locals.owner.populate("merchants", "name").execPopulate();

                let baseURL = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress/";
                let address = response[0].data.location.address;
                let geocode = axios.get(`${baseURL}?address=${address.address_line_1}+${address.locality}+${address.administrative_district_level_1}+${address.postal_code}&benchmark=2020&format=json`);

                return Promise.all([geocode, Recipe.create(recipes), res.locals.owner.save(), populateOwner]);
            })
            .then((response)=>{
                let addressData = response[0].data.result.addressMatches[0];

                merchant.address = {
                    full: addressData.matchedAddress,
                    city: addressData.addressComponents.city,
                    state: addressData.addressComponents.state,
                    zip: addressData.addressComponents.zip
                };

                merchant.location = {
                    type: "Point",
                    coordinates: [addressData.coordinates.x, addressData.coordinates.y]
                };

                return merchant.save();
            })
            .then((response)=>{
                req.session.merchant = merchant._id;

                res.json([{
                    _id: res.locals.owner._id,
                    email: res.locals.owner.email,
                    merchants: res.locals.owner.merchants,
                    name: res.locals.owner.name
                }, merchant]);

                helper.getAllMerchantTransactions(merchant, res.locals.owner.square.accessToken);
            })
            .catch((err)=>{
                if(err.name === "ValidationError") return req.session.err = err.errors[Object.keys(err.errors)[0]].properties.message;
                return res.json("ERROR: UNABLE TO CREATE NEW MERCHANT");
            });
    }
}
