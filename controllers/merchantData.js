const Merchant = require("../models/merchant");
const InventoryAdjustment = require("../models/inventoryAdjustment");

const helper = require("./helper.js");

const bcrypt = require("bcryptjs");

module.exports = {
    /*
    POST - Create a new merchant with no POS system1
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
            req.session.error = "PASSWORD MUST CONTAIN AT LEAST 10 CHARACTERS";
            return res.redirect("/register");
        }

        if(req.body.password !== req.body.confirmPassword){
            req.session.error = "PASSWORDS DO NOT MATCH";
            return res.redirect("/register");
        }

        const merchantFind = await Merchant.findOne({email: req.body.email.toLowerCase()});
        if(merchantFind !== null){
            req.session.error = "USER WITH THIS EMAIL ADDRESS ALREADY EXISTS";
            return res.redirect("/register");
        }

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);

        let expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 90);

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
            verifyId: helper.generateId(15),
            session: {
                sessionId: helper.generateId(25),
                expiration: expirationDate
            }
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
    POST - Update the quantity for a merchant inventory item
    req.body = [{
        id: id of ingredient to update,
        quantity: change in quantity
    }]
    */
    updateMerchantIngredient: function(req, res){
        let adjustments = [];
        let changedIngredients = [];
        res.locals.merchant
            .populate("inventory.ingredient")
            .execPopulate()
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
                req.session.success = "PASSWORD SUCCESSFULLY RESET. PLEASE LOG IN";
                return res.redirect("/login");
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