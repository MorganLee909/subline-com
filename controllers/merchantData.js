const Merchant = require("../models/merchant");
const Recipe = require("../models/recipe");
const InventoryAdjustment = require("../models/inventoryAdjustment");

const helper = require("./helper.js");

const axios = require("axios");
const bcrypt = require("bcryptjs");

module.exports = {
    /*
    POST - Create a new merchant with no POS system
    req.body = {
        name: retaurant name,
        email: registration email,
        password: password,
        confirmPassword: confirmation password
    }
    Redirects to /dashboard
    */
    createMerchantNone: async function(req, res){
        if(req.body.password.length < 10){
            throw "PASSWORD MUST CONTAIN AT LEAST 10 CHARACTERS";
        }

        if(req.body.password !== req.body.confirmPassword){
            throw "PASSWORDS DO NOT MATCH";
        }

        const merchantFind = await Merchant.findOne({email: req.body.email.toLowerCase()});
        if(merchantFind !== null){
            throw "USER WITH THIS EMAIL ADDRESS ALREADY EXISTS";
        }

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);

        let merchant = new Merchant({
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            password: hash,
            pos: "none",
            lastUpdatedTime: Date.now(),
            createdAt: Date.now(),
            status: ["unverified"],
            inventory: [],
            recipes: [],
            verifyId: helper.generateId(15)
        });

        merchant.save()
            .then((merchant)=>{
                return res.redirect(`/verify/email/${merchant._id}`);
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    req.session.error = err;
                }else if(err.name === "ValidationError"){
                    req.session.error = err.errors[Object.keys(err.errors)[0]].properties.message;
                }else{
                    req.session.error = "ERROR: UNABLE TO CREATE ACCOUNT AT THIS TIME";
                }
                
                return res.redirect("/");
            });
    },

    /*
    POST - Creates new Clover merchant
    Redirects to /dashboard
    */
    createMerchantClover: async function(req, res){
        let merchant = {}
        axios.get(`${process.env.CLOVER_ADDRESS}/v3/merchants/${req.session.merchantId}?access_token=${req.session.accessToken}`)
            .then((response)=>{
                merchant = new Merchant({
                    name: response.data.name,
                    pos: "clover",
                    posId: req.session.merchantId,
                    posAccessToken: req.session.accessToken,
                    lastUpdatedTime: Date.now(),
                    createdAt: Date.now(),
                    inventory: [],
                    recipes: []
                });

                return axios.get(`${process.env.CLOVER_ADDRESS}/v3/merchants/${req.session.merchantId}/items?access_token=${req.session.accessToken}`);
            })
            .then((response)=>{
                let recipes = [];
                for(let i = 0; i < response.data.elements.length; i++){
                    let recipe = new Recipe({
                        posId: response.data.elements[i].id,
                        merchant: merchant,
                        name: response.data.elements[i].name,
                        price: response.data.elements[i].price,
                        ingredients: []
                    });

                    recipes.push(recipe);
                    merchant.recipes.push(recipe);                                
                }

                Recipe.create(recipes).catch((err)=>{});

                return merchant.save();
            })
            .then((newMerchant)=>{
                req.session.accessToken = undefined;
                req.session.user = newMerchant._id;

                return res.redirect("/dashboard");
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    req.session.error = err;
                }else if(err.name === "ValidationError"){
                    req.session.error = err.errors[Object.keys(err.errors)[0]].properties.message;
                }else{
                    req.session.error = "ERROR: UNABLE TO RETRIEVE DATA FROM CLOVER";
                }
                
                return res.redirect("/");
            });
    },

    createMerchantSquare: function(req, res){
        let merchant = {}

        axios.get(`${process.env.SQUARE_ADDRESS}/v2/merchants/${req.session.merchantId}`, {
            headers: {
                Authorization: `Bearer ${req.session.accessToken}`
            }
        })
            .then((response)=>{
                req.session.merchantId = undefined;

                return new Merchant({
                    name: response.data.merchant.business_name,
                    pos: "square",
                    posId: response.data.merchant.id,
                    posAccessToken: req.session.accessToken,
                    lastUpdatedTime: new Date(),
                    createdAt: new Date(),
                    squareLocation: response.data.merchant.main_location_id,
                    inventory: [],
                    recipes: []
                });
            })
            .then((newMerchant)=>{
                req.session.accessToken = undefined;
                merchant = newMerchant;
                
                return axios.post(`${process.env.SQUARE_ADDRESS}/v2/catalog/search`, {
                    object_types: ["ITEM"]
                }, {
                    headers: {
                        Authorization: `Bearer ${merchant.posAccessToken}`
                    }
                });
            })
            .then((response)=>{
                let recipes = [];
                
                for(let i = 0; i < response.data.objects.length; i++){
                    if(response.data.objects[i].item_data.variations.length > 1){
                        for(let j = 0; j < response.data.objects[i].item_data.variations.length; j++){
                            let recipe = new Recipe({
                                posId: response.data.objects[i].item_data.variations[j].id,
                                merchant: merchant._id,
                                name: `${response.data.objects[i].item_data.name} '${response.data.objects[i].item_data.variations[j].item_variation_data.name}'`,
                                price: response.data.objects[i].item_data.variations[j].item_variation_data.price_money.amount
                            });

                            recipes.push(recipe);
                            merchant.recipes.push(recipe);
                        }
                    }else{
                        let recipe = new Recipe({
                            posId: response.data.objects[i].item_data.variations[0].id,
                            merchant: merchant._id,
                            name: response.data.objects[i].item_data.name,
                            price: response.data.objects[i].item_data.variations[0].item_variation_data.price_money.amount,
                            ingredients: []
                        });

                        recipes.push(recipe);
                        merchant.recipes.push(recipe);
                    }
                }

                return Recipe.create(recipes);
            })
            .then((recipes)=>{
                return merchant.save();
            })
            .then((merchant)=>{
                req.session.user = merchant._id;

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

    /*
    POST - Update the quantity for a merchant inventory item
    req.body = [{
        id: id of ingredient to update,
        quantity: change in quantity
    }]
    */
    updateMerchantIngredient: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let adjustments = [];
        let changedIngredients = [];
        Merchant.findOne({_id: req.session.user})
            .populate("inventory.ingredient")
            .then((merchant)=>{
                for(let i = 0; i < req.body.length; i++){
                    let updateIngredient;
                    for(let j = 0; j < merchant.inventory.length; j++){
                        if(merchant.inventory[j].ingredient._id.toString() === req.body[i].id){
                            updateIngredient = merchant.inventory[j];
                            break;
                        }
                    }

                    adjustments.push(new InventoryAdjustment({
                        date: Date.now(),
                        merchant: req.session.user,
                        ingredient: req.body[i].id,
                        quantity: req.body[i].quantity - updateIngredient.quantity,
                    }));

                    updateIngredient.quantity = helper.convertQuantityToBaseUnit(req.body[i].quantity, updateIngredient.defaultUnit);
                    changedIngredients.push(updateIngredient);
                }

                return merchant.save();
            })
            .then((newMerchant)=>{
                res.json(changedIngredients);

                InventoryAdjustment.create(adjustments).catch(()=>{});
                return;
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO UPDATE DATA");
            });        
    },

    /*
    POST - Changes the users password
    req.body = {
        pass: new password,
        confirmPass: new password confirmation,
        hash: hashed version of old password
    }
    */
    updatePassword: function(req, res){
        Merchant.findOne({password: req.body.hash})
            .then((merchant)=>{
                if(merchant){
                    if(req.body.pass.length < 10){
                        throw "PASSWORD MUST CONTAIN AT LEAST 10 CHARACTERS";
                    }
                    if(req.body.pass !== req.body.confirmPass){
                        throw "PASSWORDS DO NOT MATCH";
                    }

                    let salt = bcrypt.genSaltSync(10);
                    let hash = bcrypt.hashSync(req.body.pass, salt);

                    merchant.password = hash;

                    return merchant.save();
                }else{
                    req.session.error = "ERROR: UNABLE TO RETRIEVE USER DATA";
                    return res.redirect("/");
                }
            })
            .then((merchant)=>{
                req.session.error = "PASSWORD SUCCESSFULLY RESET. PLEASE LOG IN";
                return res.redirect("/");
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO UPDATE YOUR PASSWORD");
            });
    }
}