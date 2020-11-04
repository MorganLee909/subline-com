const Merchant = require("../models/merchant.js");

const helper = require("./helper.js");
const mailgun = require("mailgun-js")({apiKey: process.env.MG_SUBLINE_APIKEY, domain: "mail.thesubline.net"});
const passwordReset = require("../emails/passwordReset.js");

module.exports = {
    enterEmail: function(req, res){
        return res.render("passwordResetPages/email");
    },

    generateCode: function(req, res){
        Merchant.findOne({email: req.body.email})
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
                        link: `${process.env.SITE}/reset/${merchant.verifyId}`
                    })
                };
                mailgun.messages().send(mailgunData, (err, body)=>{
                    console.log(err);
                });

                return merchant.save();
            })
            .then((merchant)=>{
                req.session.error = "PASSWORD RESET EMAIL SENT";
                return res.redirect("/");
            })
            .catch((err)=>{
                console.log(err);
                req.session.error = "ERROR: UNABLE TO RESET PASSWORD AT THIS TIME";
                return res.redirect("/");
            });
    },

    enterPassword: function(req, res){
        return res.render("passwordResetPages/password", {code: req.params.code});
    }
}