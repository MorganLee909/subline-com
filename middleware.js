const Merchant = require("./models/merchant.js")

const helper = require("./controllers/helper.js");

const axios = require("axios");

module.exports = {
    verifySession: function(req, res, next){
        if(req.session.user === undefined) {
            req.session.error = "PLEASE LOG IN";
            return res.redirect("/login");
        }
    
        Merchant.findOne({"session.sessionId": req.session.user})
            .then(async (merchant)=>{
                if(merchant === null){
                    throw "login";
                }
    
                //Check if session is out of date
                if(merchant.session.date < new Date()){
                    let newExpiration = new Date();
                    newExpiration.setDate(newExpiration.getDate() + 90);
    
                    merchant.session.sessionId = helper.generateId(25);
                    merchant.session.date = newExpiration;
                    merchant.save();
                    throw "login";
                }

                //Check if email has not been verified
                if(merchant.status.includes("unverified")){
                    req.session.error = "PLEASE VERIFY YOUR EMAIL ADDRESS";
                    return res.redirect(`/verify/email/${merchant._id}`);
                }

                //Check for suspended account
                if(merchant.status.includes("suspended")){
                    req.session.error = "ACCOUNT SUSPENDED. PLEASE CONTACT SUPPORT IF THIS IS IN ERROR";
                    return res.redirect("/");
                }

                //Check for out of date access token
                let cutoff = new Date();
                cutoff.setDate(cutoff.getDate() + 1);
                if(merchant.square.expires < cutoff){
                    let data = await axios.post(`${process.env.SQUARE_ADDRESS}/oauth2/token`, {
                        client_id: process.env.SUBLINE_SQUARE_APPID,
                        client_secret: process.env.SUBLINE_SQUARE_APPSECRET,
                        grant_type: "refresh_token",
                        refresh_token: merchant.square.refreshToken
                    });

                    merchant.square.accessToken = data.data.access_token;
                    merchant.square.expires = new Date(data.data.expires_at);

                    await merchant.save();
                }

                res.locals.merchant = merchant;
                return next();
            })
            .catch((err)=>{
                if(err === "login"){
                    req.session.user = undefined;
                    req.session.error = "PLEASE LOG IN";
                    return res.redirect("/login");
                }
                return res.json("ERROR: UNABLE TO RETRIEVE DATA");
            });
    },

    formatBanner: function(req, res, next){
        if(req.session.error !== undefined){
            res.locals.banner = {
                type: "error",
                message: req.session.error,
                color: "red"
            };
            req.session.error = undefined;
        }else if(req.session.success !== undefined){
            res.locals.banner = {
                type: "notification",
                message: req.session.success,
                color: "green"
            };
            req.session.success = undefined;
        }

        return next();
    }
}

