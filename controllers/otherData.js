const Owner = require("../models/owner.js");
const Feedback = require("../models/feedback.js");

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
        Owner.findOne({email: req.body.email.toLowerCase()})
            .then((owner)=>{
                if(owner !== null){
                    bcrypt.compare(req.body.password, owner.password, async (err, result)=>{
                        if(result === true){
                            //Check if email has not been verified
                            if(owner.status.includes("unverified")){
                                req.session.error = "PLEASE VERIFY YOUR EMAIL ADDRESS";
                                return res.redirect(`/verify/email/${owner._id}`);
                            }

                            //Check for suspended account
                            if(owner.status.includes("suspended")){
                                req.session.error = "ACCOUNT SUSPENDED. PLEASE CONTACT SUPPORT IF THIS IS IN ERROR";
                                return res.redirect("/");
                            }

                            //Check for out of date access token
                            let cutoff = new Date();
                            cutoff.setDate(cutoff.getDate() + 1);
                            if(owner.square !== undefined && owner.square.expires < cutoff){
                                let data = await axios.post(`${process.env.SQUARE_ADDRESS}/oauth2/token`, {
                                    client_id: process.env.SUBLINE_SQUARE_APPID,
                                    client_secret: process.env.SUBLINE_SQUARE_APPSECRET,
                                    grant_type: "refresh_token",
                                    refresh_token: merchant.square.refreshToken
                                });

                                owner.square.accessToken = data.data.access_token;
                                owner.square.expires = new Date(data.data.expires_at);

                                await owner.save();
                            }

                            req.session.owner = owner.session.sessionId;
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
            merchant: res.locals.owner._id,
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
    }
}