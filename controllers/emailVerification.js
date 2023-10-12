const Owner = require("../models/owner.js");

const axios = require("axios");
const verifyEmail = require("../emails/verifyEmail.js");
const queryString = require("querystring")

module.exports = {
    sendVerifyEmail: function(req, res){
        let saveOwner = {};
        Owner.findOne({_id: req.params.id})
            .then((owner)=>{
                saveOwner = owner;

                return axios({
                    method: "post",
                    url: `https://api.mailgun.net/v3/mg.leemorgan.dev/messages`,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    auth: {
                        username: "api",
                        password: process.env.SUBLINE_MAILGUN_API
                    },
                    data: queryString.stringify({
                        from: "The Subline <subline@leemorgan.dev>",
                        to: owner.email,
                        subject: "The Subline Email Verification",
                        html: verifyEmail({
                            name: owner.name,
                            link: `https://subline.leemorgan.dev/verify/${owner._id}/${owner.session.sessionId}`
                        })
                    })
                });
            })
            .then((response)=>{
                return res.render(`verifyPage/verify`, {id: saveOwner._id, email: saveOwner.email, banner: res.locals.merchant});
            })
            .catch((err)=>{
                console.error(err);
                req.session.error = "ERROR: UNABLE TO SEND VERIFICATION EMAIL";
                return res.redirect("/");
            });
    },

    resendEmail: function(req, res){
        Owner.findOne({email: req.body.email.toLowerCase()})
            .then((owner)=>{
                if(owner) throw "USER WITH THIS EMAIL ADDRESS ALREADY EXISTS";

                return owner.findOne({_id: req.body.id});
            })
            .then((owner)=>{
                owner.email = req.body.email.toLowerCase();

                return owner.save();
            })
            .then((owner)=>{
                return res.redirect(`/verify/email/${owner._id}`);
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    req.session.error = err;
                }else if(err.name === "ValidationError"){
                    req.session.error = err.errors[Object.keys(err.errors)[0]].properties.message;
                }else{
                    req.session.error = "ERROR: UNABLE TO CHANGE YOUR EMAIL ADDRESS";
                }
                return res.redirect("/");
            });
    },

    verify: function(req, res){
        Owner.findOne({_id: req.params.id})
            .then((owner)=>{
                if(req.params.code !== owner.session.sessionId) throw "UNABLE TO VERIFY EMAIL ADDRESS. INCORRECT LINK";

                owner.status.splice(owner.status.indexOf("unverified"), 1);

                return owner.save();
            })
            .then((owner)=>{
                req.session.owner = owner.session.sessionId;
                req.session.merchant = owner.merchants[0].toString();

                return res.redirect("/dashboard");
            })
            .catch((err)=>{
		console.error(err);
                if(typeof(err) === "string"){
                    req.session.error = err;
                }else{
                    req.session.error = "ERROR: UNABLE TO VERIFY EMAIL ADDRESS"
                }

                return res.redirect("/");
            });
    }
}
