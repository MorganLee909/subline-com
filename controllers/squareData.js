const Merchant = require("../models/merchant.js");
const Recipe = require("../models/recipe.js");

const axios = require("axios");
const helper = require("./helper.js");

module.exports = {
    //GET - Redirects user to Square OAuth page
    redirect: function(req, res){
        return res.redirect(`${process.env.SQUARE_ADDRESS}/oauth2/authorize?client_id=${process.env.SUBLINE_SQUARE_APPID}&scope=INVENTORY_READ+ITEMS_READ+MERCHANT_PROFILE_READ+ORDERS_READ+PAYMENTS_READ`);
    },

    //GET: Used by square. This route is used for the authentication code
    //Redirects to either dashboard or new merchant creation
    authorize: function(req, res){
        const code = req.url.slice(req.url.indexOf("code=") + 5, req.url.indexOf("&"));
        const url = `${process.env.SQUARE_ADDRESS}/oauth2/token`;
        let data = {
            client_id: process.env.SUBLINE_SQUARE_APPID,
            client_secret: process.env.SUBLINE_SQUARE_APPSECRET,
            grant_type: "authorization_code",
            code: code
        };
    
        axios.post(url, data)
            .then((response)=>{
                data = response.data;
                return Merchant.findOne({posId: data.merchant_id});
            })
            .then((merchant)=>{
                if(merchant){
                    merchant.posAccessToken = data.access_token;
    
                    return merchant.save()
                        .then((merchant)=>{
                            req.session.user = merchant.session.sessionId;
                            return res.redirect("/dashboard");
                        })
                        .catch((err)=>{
                            req.session.error = "ERROR: UNABLE TO CREATE NEW USER";
                            return res.redirect("/");
                        })
                }else{
                    req.session.merchantId = data.merchant_id;
                    req.session.accessToken = data.access_token;
    
                    return res.redirect("/merchant/create/square");
                }
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO RETRIEVE DATA FROM SQUARE";
                return res.redirect("/");
            });
    },

    //GET: Gathers all data from square to create our merchant
    //Redirects to the dashboard
    createMerchant: function(req, res){
        let merchant = {}
    
        axios.get(`${process.env.SQUARE_ADDRESS}/v2/merchants/${req.session.merchantId}`, {
            headers: {
                Authorization: `Bearer ${req.session.accessToken}`
            }
        })
            .then((response)=>{
                req.session.merchantId = undefined;

                let expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 90);
    
                merchant = new Merchant({
                    name: response.data.merchant.business_name,
                    pos: "square",
                    posId: response.data.merchant.id,
                    posAccessToken: req.session.accessToken,
                    lastUpdatedTime: new Date(),
                    createdAt: new Date(),
                    squareLocation: response.data.merchant.main_location_id,
                    status: [],
                    inventory: [],
                    recipes: [],
                    session: {
                        sessionId: helper.generateId(25),
                        expiration: expirationDate
                    }
                });

                req.session.accessToken = undefined;

                let items = axios.post(`${process.env.SQUARE_ADDRESS}/v2/catalog/search`, {
                    object_types: ["ITEM"]
                }, {
                    headers: {
                        Authorization: `Bearer ${merchant.posAccessToken}`
                    }
                });

                let location = axios.get(`${process.env.SQUARE_ADDRESS}/v2/locations/${response.data.merchant.main_location_id}`, {
                    headers: {
                        Authorization: `Bearer ${merchant.posAccessToken}`
                    }
                });

                return Promise.all([items, location]);
            })
            .then((response)=>{
                merchant.email = response[1].data.location.business_email;
                let recipes = [];
                
                for(let i = 0; i < response[0].data.objects.length; i++){
                    if(response[0].data.objects[i].item_data.variations.length > 1){
                        for(let j = 0; j < response[0].data.objects[i].item_data.variations.length; j++){
                            let recipe = new Recipe({
                                posId: response[0].data.objects[i].item_data.variations[j].id,
                                merchant: merchant._id,
                                name: `${response[0].data.objects[i].item_data.name} '${response[0].data.objects[i].item_data.variations[j].item_variation_data.name}'`,
                                price: response[0].data.objects[i].item_data.variations[j].item_variation_data.price_money.amount
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
    
                return res.redirect("/dashboard");
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
}