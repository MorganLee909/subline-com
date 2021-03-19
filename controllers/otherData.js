const Merchant = require("../models/merchant");

const bcrypt = require("bcryptjs");

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
                if(merchant !== null){
                    bcrypt.compare(req.body.password, merchant.password, (err, result)=>{
                        if(result === true){
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
                            if(merchant.pos === "square" && merchant.square.expires < cutoff){
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

                            req.session.user = merchant.session.sessionId;
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
        req.session.user = undefined;

        return res.redirect("/");
    }
}