const Owner = require("../models/owner.js");
const Merchant = require("../models/merchant.js");
const Feedback = require("../models/feedback.js");

const helper = require("./helper.js");

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
        let owner = Owner.findOne({email: req.body.email.toLowerCase()});
        let merchant = Merchant.findOne({_id: req.session.merchant});

        Promise.all([owner, merchant])
            .then((response)=>{
                if(response[0] !== null){
                    bcrypt.compare(req.body.password, response[0].password, async (err, result)=>{
                        if(result === true){
                            //Check if email has not been verified
                            if(response[0].status.includes("unverified")){
                                req.session.error = "PLEASE VERIFY YOUR EMAIL ADDRESS";
                                return res.redirect(`/verify/email/${response[0]._id}`);
                            }

                            //Check for suspended account
                            if(response[0].status.includes("suspended")){
                                req.session.error = "ACCOUNT SUSPENDED. PLEASE CONTACT SUPPORT IF THIS IS IN ERROR";
                                return res.redirect("/");
                            }

                            //Check for out of date access token
                            let cutoff = new Date();
                            cutoff.setDate(cutoff.getDate() + 1);
                            if(response[0].square !== undefined && response[0].square.expires < cutoff){
                                let data = await axios.post(`${process.env.SQUARE_ADDRESS}/oauth2/token`, {
                                    client_id: process.env.SUBLINE_SQUARE_APPID,
                                    client_secret: process.env.SUBLINE_SQUARE_APPSECRET,
                                    grant_type: "refresh_token",
                                    refresh_token: merchant.square.refreshToken
                                });

                                response[0].square.accessToken = data.data.access_token;
                                response[0].square.expires = new Date(data.data.expires_at);

                                await response[0].save();
                            }

                            let gotMerchant = (response[1] === null) ? await Merchant.findOne({_id: response[0].merchants[0]}) : response[1];
                            req.session.merchant = gotMerchant._id;
                            req.session.owner = response[0].session.sessionId;
                            return res.redirect("/dashboard");
                        }else{
                            req.session.error = "INVALID EMAIL OR PASSWORD";
                            return res.redirect("/login");
                        }
                    });
                }else{
                    req.session.error = "INVALID EMAIL OR PASSWORD";
                    return res.redirect("/login");
                }
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO RETRIEVE DATA";

                return res.redirect("/");
            });
    },

    /*
    GET - logs the user out
    Redirects to /
    */
    logout: function(req, res){
        req.session.owner = undefined;

        return res.redirect("/");
    },

    /*
    POST: create user feedback
    req.body = {
        title: String,
        content: String,
        date: String (Number, unix time)
    }
    response = {}
    */
    feedback: function(req, res){
        let feedback = new Feedback({
            merchant: res.locals.merchant._id,
            title: req.body.title,
            content: req.body.content,
            date: new Date(req.body.date)
        });

        feedback.save()
            .then((feedback)=>{
                return res.json({});
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO SAVE DATA");
            });
    },

    /*
    GET: changes the session id and logs user out
    redirect = "/"
    */
    endSession: function(req, res){
        let newExpiration = new Date();
        newExpiration.setDate(newExpiration.getDate() + 90);

        res.locals.owner.session.sessionId = helper.generateId(25);
        res.locals.owner.session.expiration = newExpiration;

        req.session.owner = undefined;
        req.session.merchant = undefined;

        res.locals.owner.save()
            .then(()=>{
                return res.redirect("/");
            })
            .catch((err)=>{
                return res.json("ERROR: SOMETHING WENT WRONG. PLEASE CONTACT SUPPORT.");
            });
    }
}