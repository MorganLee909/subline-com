const Owner = require("../models/owner.js");
const Merchant = require("../models/merchant.js");
const InventoryAdjustment = require("../models/inventoryAdjustment");
const Transaction = require("../models/transaction.js");

const helper = require("./helper.js");
const verifyEmail = require("../emails/verifyEmail.js");

const bcrypt = require("bcryptjs");
const mailgun = require("mailgun-js")({apiKey: process.env.MG_SUBLINE_APIKEY, domain: "mail.thesubline.net"});

module.exports = {
    /*
    GET: gets a merchant to send back to its owner
    req.params.id = String (merchant id)
    response = [Owner, Merchant];
    */
    getMerchant: function(req, res){
        let owner = Owner.findOne({"session.sessionId": req.session.owner}).populate("merchants", "name");
        let merchant = Merchant.findOne({_id: req.params.id}).populate("inventory.ingredient").populate("recipes");
        let transactions = Transaction.find({merchant: req.params.id});

        Promise.all([owner, merchant, transactions])
            .then((response)=>{
                if(response[0] === null || response[1] === null) throw "unfound";
                if(response[1].owner.toString() !== response[0]._id.toString()) throw "permissions";

                let responseOwner = {
                    _id: response[0]._id,
                    email: response[0].email,
                    merchants: response[0].merchants
                };

                for(let i = 0; i < responseOwner.merchants.length; i++){
                    if(response[1]._id.toString() === responseOwner.merchants[i]._id.toString()){
                        responseOwner.merchants.splice(i, 1);
                        break;
                    }
                }

                response[1].owner = undefined;
                response[1].createdAt = undefined;

                req.session.merchant = response[1]._id;

                return res.json([responseOwner, response[1], response[2]]);
            })
            .catch((err)=>{
                if(err === "unfound") return res.json("UNABLE TO FIND THAT MERCHANT");
                if(err === "permissions") return res.json("YOU DO NOT HAVE PERMISSION TO DO THAT");
                return res.json("ERROR: UNABLE TO RETRIEVE DATA");
            });
    },

    /*
    POST - Create a new merchant with no POS system
    req.body = {
        name: retaurant name,
        email: registration email,
        password: password,
        confirmPassword: confirmation password
        owner: String (id of the owner, new owner of undefined)
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

        let email = req.body.email.toLowerCase();
        const merchantFind = await Merchant.findOne({email: email});
        if(merchantFind !== null){
            req.session.error = "USER WITH THIS EMAIL ADDRESS ALREADY EXISTS";
            return res.redirect("/login");
        }

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);

        let expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 90);

        let owner = new Owner({
            email: email,
            password: hash,
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
            pos: "none",
            createdAt: Date.now(),
            inventory: [],
            recipes: []
        });

        owner.merchants.push(merchant._id);

        Promise.all([owner.save(), merchant.save()])
            .then((response)=>{
                return res.redirect(`/verify/email/${response[0]._id}`);
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
    POST: create new merchant for existing owner
    req.body = {
        name: String
    }
    response = [Owner, Merchant]
    */
    addMerchantNone: function(req, res){
        let merchant = new Merchant({
            owner: res.locals.owner._id,
            name: req.body.name,
            pos: "none",
            createdAt: new Date(),
            inventory: [],
            recipes: []
        });

        res.locals.owner.merchants.push(merchant._id);

        let populate = res.locals.owner.populate("merchants", "name").execPopulate();

        Promise.all([res.locals.owner.save(), merchant.save(), populate])
            .then((response)=>{
                let owner = {
                    _id: response[0]._id,
                    email: response[0].email,
                    merchants: response[0].merchants
                }

                req.session.merchant = response[1]._id;
                
                return res.json([owner, response[1]]);
            })
            .catch((err)=>{
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO CREATE NEW MERCHANT");
            });
    },

    /*
    POST - Update the quantity for a merchant inventory item
    req.body = [{
        id: id of ingredient to update,
        quantity: change in quantity
    }]
    */
    updateIngredientQuantities: function(req, res){
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
                        merchant: req.session.owner,
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
                    req.session.error = "ERROR: UNABLE TO RETRIEVE DATA";
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
    },

    /*
    PUT: Update merchant data
    req.body = {
        email: String (merchant email address)
    },
    response = {
        email: String (merchant)
    }
    */
    updateData: async function(req, res){
        if(req.body.email !== res.locals.owner.email){
            let ownerCheck = await Owner.findOne({email: req.body.email});
            if(ownerCheck !== null) return res.json("USER WITH THIS EMAIL ADDRESS ALREADY EXISTS");

            res.locals.owner.email = req.body.email.toLowerCase();
            res.locals.owner.status.push("unverified");

            const mailgunData = {
                from: "The Subline <clientsupport@thesubline.net>",
                to: res.locals.owner.email,
                subject: "Email Verification",
                html: verifyEmail({
                    name: res.locals.owner.name,
                    link: `${process.env.SITE}/verify/${res.locals.owner._id}/${res.locals.owner.session.sessionId}`
                })
            };
            mailgun.messages().send(mailgunData, (err, body)=>{});
        }

        res.locals.owner.save()
            .then((owner)=>{
                return res.json({email: res.locals.owner.email});
            })
            .catch((err)=>{
                if(err.name === "ValidationError") return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                return res.json("ERROR: UNABLE TO UPDATE DATA");
            });
    },

    /*
    PUT: Update merchant password with current password
    req.body = {
        current: String (current merchant password),
        new: String (new password),
        confirm: String (new password again for confirmation)
    }
    response = {redirect: String (link to redirect to)}
    */
    changePassword: function(req, res){
        if(req.body.new !== req.body.confirm) return res.json("PASSWORDS DO NOT MATCH");

        bcrypt.compare(req.body.current, res.locals.owner.password, (err, result)=>{
            if(result === true){
                let salt = bcrypt.genSaltSync(10);
                let hash = bcrypt.hashSync(req.body.new, salt);

                res.locals.owner.password = hash;

                let newExpiration = new Date();
                newExpiration.setDate(newExpiration.getDate() + 90);
                res.locals.owner.session.sessionId = helper.generateId(25);
                res.locals.owner.session.expiration = newExpiration;

                res.locals.owner.save()
                    .then((owner)=>{
                        req.session.owner = undefined;
                        req.session.merchant = undefined;
                        req.session.success = "PASSWORD RESET. PLEASE LOG IN AGAIN.";
                        return res.json({redirect: `http://${process.env.SITE}/login`});
                    })
                    .catch((err)=>{
                        return res.json("ERROR: UNABLE TO UPDATE PASSWORD");
                    });
            }else{
                return res.json("INCORRECT PASSWORD");
            }
        });
    },

    /*
    DELETE: remove a merchant from its owner
    response = [Owner, Merchant (the next), [Transaction]]
    */
    deleteMerchant: function(req, res){
        if(res.locals.owner.merchants.length === 1) throw "one";
        for(let i = 0; i < res.locals.owner.merchants.length; i++){
            if(res.locals.owner.merchants[i].toString() === res.locals.merchant._id.toString()){
                res.locals.owner.merchants.splice(i, 1);
                break;
            }
        }

        res.locals.merchant.removed = true;

        Promise.all([
            Merchant.findOne({_id: res.locals.owner.merchants[0]._id}).populate("inventory.ingredient").populate("recipes"),
            res.locals.owner.save(),
            res.locals.merchant.save(),
            res.locals.owner.populate("merchants", "name").execPopulate(),
            Transaction.find({merchant: res.locals.owner.merchants[0]._id})
        ])
            .then((response)=>{
                let responseOwner = {
                    _id: res.locals.owner._id,
                    email: res.locals.owner.email,
                    merchants: res.locals.owner.merchants.slice(1)
                };

                response[0].owner = undefined;
                response[0].createdAt = undefined;
                response[0].locationId = undefined;

                req.session.merchant = response[0]._id;

                return res.json([responseOwner, response[0], response[4]]);
            })
            .catch((err)=>{
                if(err === "one") return res.json("YOU CANNOT DELETE YOUR ONLY MERCHANT");
                return res.json("ERROR: UNABLE TO DELETE THE MERCHANT");
            });
    }
}