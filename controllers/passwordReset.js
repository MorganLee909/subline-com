const Owner = require("../models/owner.js");

const passwordReset = require("../emails/passwordReset.js");

const queryString = require("querystring");
const axios = require("axios");
const bcrypt = require("bcryptjs");

module.exports = {
    enterEmail: function(req, res){
        return res.render("passwordResetPages/email");
    },

    generateCode: function(req, res){
        Owner.findOne({email: req.body.email.toLowerCase()})
            .then((owner)=>{
                if(owner === null){
                    req.session.error = "USER WITH THIS EMAIL DOES NOT EXIST";
                    return res.redirect("/");
                }

                axios({
                    method: "post",
                    url: "https://api.mailgun.net/v3/mg.leemorgan.dev/messages",
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
                        subject: "Password Reset for The Subline",
                        html: passwordReset({
                            name: owner.name,
                            link: `${process.env.SITE}/reset/${owner._id}/${owner.session.sessionId}`
                        })
                    })
                });

                req.session.success = "PASSWORD RESET EMAIL SENT";
                return res.redirect("/");
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO RESET PASSWORD AT THIS TIME";
                return res.redirect("/");
            });
    },

    enterPassword: function(req, res){
        return res.render("passwordResetPages/password", {id: req.params.id, code: req.params.code, banner: res.locals.banner});
    },

    resetPassword: function(req, res){
        Owner.findOne({_id: req.body.id})
            .then((owner)=>{
                if(owner.session.sessionId !== req.body.code){
                    req.session.error = "YOUR ACCOUNT COULD NOT BE VERIFIED. PLEASE CONTACT US IF THE PROBLEM PERSISTS.";
                    return res.redirect("/");
                }

                if(req.body.password !== req.body.confirmPassword){
                    req.session.error = "PASSWORDS DO NOT MATCH";
                    return res.redirect(`/reset/${owner._id}/${owner.session.sessionId}`);
                }

                if(req.body.password.length < 10){
                    req.session.error = "PASSWORD MUST CONTAIN AT LEAST 10 CHARACTERS";
                    return res.redirect(`/reset/${owner._id}/${owner.session.sessionId}`);
                }

                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(req.body.password, salt);

                owner.password = hash;

                return owner.save();
            })
            .then((owner)=>{
                if(owner !== undefined){
                    req.session.success = "PASSWORD SUCCESSFULLY UPDATED.  PLEASE LOG IN";
                    return res.redirect("/login");
                }
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    req.session.error = err;
                }else if(err.name === "ValidationError"){
                    req.session.error = err.errors[Object.keys(err.errors)[0]].properties.message;
                }else{
                    req.session.error = "ERROR: UNABLE TO UPDATE YOUR PASSWORD";
                }
                return res.redirect("/");
            });
    }
}