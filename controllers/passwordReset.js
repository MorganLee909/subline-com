const Merchant = require("../models/merchant.js");

const helper = require("./helper.js");
const passwordReset = require("../emails/passwordReset.js");

const mailgun = require("mailgun-js")({apiKey: process.env.MG_SUBLINE_APIKEY, domain: "mail.thesubline.net"});
const bcrypt = require("bcryptjs");

module.exports = {
    enterEmail: function(req, res){
        return res.render("passwordResetPages/email");
    },

    generateCode: function(req, res){
        Merchant.findOne({email: req.body.email.toLowerCase()})
            .then((merchant)=>{
                if(merchant === null){
                    req.session.error = "USER WITH THIS EMAIL DOES NOT EXIST";
                    return res.redirect("/");
                }

                merchant.verifyId = helper.generateId(15);
                
                const mailgunData = {
                    from: "The Subline <clientsupport@thesusbline.net>",
                    to: merchant.email,
                    subject: "Password Reset",
                    html: passwordReset({
                        name: merchant.name,
                        link: `${process.env.SITE}/reset/${merchant._id}/${merchant.verifyId}`
                    })
                };
                mailgun.messages().send(mailgunData, (err, body)=>{});

                return merchant.save();
            })
            .then((merchant)=>{
                req.session.error = "PASSWORD RESET EMAIL SENT";
                return res.redirect("/");
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO RESET PASSWORD AT THIS TIME";
                return res.redirect("/");
            });
    },

    enterPassword: function(req, res){
        let error = {};
        if(req.session.error){
            error = req.session.error;
            req.session.error = undefined;
        }else{
            error = null;
        }

        return res.render("passwordResetPages/password", {id: req.params.id, code: req.params.code, error: error});
    },

    resetPassword: function(req, res){
        Merchant.findOne({_id: req.body.id})
            .then((merchant)=>{
                if(merchant.verifyId !== req.body.code){
                    req.session.error = "YOUR ACCOUNT COULD NOT BE VERIFIED.  PLEASE CONTACT US IF THE PROBLEM PERSISTS.";
                    return res.redirect("/");
                }

                if(req.body.password !== req.body.confirmPassword){
                    req.session.error = "PASSWORDS DO NOT MATCH";
                    return res.redirect(`/reset/${merchant._id}/${merchant.verifyId}`);
                }

                if(req.body.password.length < 10){
                    req.session.error = "PASSWORD MUST CONTAIN AT LEAST 10 CHARACTERS";
                    return res.redirect(`/reset/${merchant._id}/${merchant.verifyId}`);
                }

                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(req.body.password, salt);

                merchant.password = hash;
                merchant.verifyId = undefined;

                return merchant.save();
            })
            .then((merchant)=>{
                if(merchant !== undefined){
                    req.session.error = "PASSWORD SUCCESSFULLY UPDATED.  PLEASE LOG IN";
                    return res.redirect("/");
                }
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO UPDATE YOUR PASSWORD AT THIS TIME";
                return res.redirect("/");
            });
    }
}