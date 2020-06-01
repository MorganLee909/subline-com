const bcrypt = require("bcryptjs");
const axios = require("axios");

const Merchant = require("../models/merchant");
const Order = require("../models/order");
const Transaction = require("../models/transaction");

module.exports = {
    /*
    POST - logs the user in
    req.body = {
        email: email of the user,
        password: password of the user
    }
    Redirects to /dashboard
    */
    login: function(req, res){
        Merchant.findOne({email: req.body.email.toLowerCase()})
            .then((merchant)=>{
                if(merchant){
                    bcrypt.compare(req.body.password, merchant.password, (err, result)=>{
                        if(result){
                            req.session.user = merchant._id;
                            return res.redirect("/dashboard");
                        }else{
                            req.session.error = "Invalid email or password";
                            return res.redirect("/");
                        }
                    });
                }else{
                    req.session.error = "Invalid email or password";
                    return res.redirect("/");
                }
            })
            .catch((err)=>{
                req.session.error = "There was an error and your data could not be retrieved";

                return res.redirect("/");
            });
    },

    /*
    GET - logs the user out
    Redirects to /
    */
    logout: function(req, res){
        req.session.user = undefined;

        return res.redirect("/");
    },

    //GET - Redirects user to Clover OAuth page
    cloverRedirect: function(req, res){
        return res.redirect(`${process.env.CLOVER_ADDRESS}/oauth/authorize?client_id=${process.env.SUBLINE_CLOVER_APPID}&redirect_uri=${process.env.SUBLINE_CLOVER_URI}`);
    },

    //GET - Get access token from clover and  redirect to merchant creation
    cloverAuth: function(req, res){
        let dataArr = req.url.slice(req.url.indexOf("?") + 1).split("&");
        let authorizationCode = "";
        let merchantId = "";

        for(let str of dataArr){
            if(str.slice(0, str.indexOf("=")) === "merchant_id"){
                merchantId = str.slice(str.indexOf("=") + 1);
            }else if(str.slice(0, str.indexOf("=")) === "code"){
                authorizationCode = str.slice(str.indexOf("=") + 1);
            }
        }

        axios.get(`${process.env.CLOVER_ADDRESS}/oauth/token?client_id=${process.env.SUBLINE_CLOVER_APPID}&client_secret=${process.env.SUBLINE_CLOVER_APPSECRET}&code=${authorizationCode}`)
            .then((response)=>{
                Merchant.findOne({posId: merchantId})
                    .then((merchant)=>{
                        if(merchant){
                            merchant.posAccessToken = response.data.access_token;

                            merchant.save()
                                .then((updatedMerchant)=>{
                                    req.session.user = updatedMerchant._id;
                                    return res.redirect("/dashboard");
                                })
                                .catch((err)=>{
                                    req.session.error("Error: unable to save critical data.  Try again.");
                                    return res.redirect("/")
                                });
                        }else{
                            req.session.merchantId = merchantId;
                            req.session.accessToken = response.data.access_token;
                            return res.redirect("/merchant/create/clover");
                        }
                    })
                    .catch((err)=>{
                        req.session.error = "Error: there was an oopsies";
                    });
                
            })
            .catch((err)=>{
                req.session.error = "Error: Unable to retrieve data from Clover";
                return res.redirect("/");
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
    resetPassword: function(req, res){
        Merchant.findOne({password: req.body.hash})
            .then((merchant)=>{
                if(merchant && req.body.pass === req.body.confirmPass){
                    let salt = bcrypt.genSaltSync(10);
                    let hash = bcrypt.hashSync(req.body.pass, salt);

                    merchant.password = hash;

                    return merchant.save();
                }else{
                    req.session.error = "Error: unable to retrieve merchant data";
                    return res.redirect("/");
                }
            })
            .then((merchant)=>{
                req.session.error = "Password successfully reset.  Please log in";
                return res.redirect("/");
            })
            .catch((err)=>{});
    }
} 