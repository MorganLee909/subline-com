const Merchant = require("../models/merchant");

const bcrypt = require("bcryptjs");
const axios = require("axios");

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
                            req.session.user = merchant.session.sessionId;
                            return res.redirect("/dashboard");
                        }else{
                            req.session.error = "INVALID EMAIL OR PASSWORD";
                            return res.redirect("/");
                        }
                    });
                }else{
                    req.session.error = "INVALID EMAIL OR PASSWORD";
                    return res.redirect("/");
                }
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO RETRIEVE USER DATA";

                return res.redirect("/");
            });
    },

    /*
    GET - logs the user out
    Redirects to /
    */
    logout: function(req, res){
        req.session.user = null;

        return res.redirect("/");
    }
}