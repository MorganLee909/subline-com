const Merchant = require("../models/merchant.js");

const mailgun = require("mailgun-js")({apiKey: process.env.MG_SUBLINE_APIKEY, domain: "mail.thesubline.net"});
const verifyEmail = require("../emails/verifyEmail.js");

module.exports = {
    sendVerifyEmail: function(req, res){
        Merchant.findOne({_id: req.params.id})
            .then((merchant)=>{
                const mailgunData = {
                    from: "The Subline <clientsupport@thesubline.net>",
                    to: merchant.email,
                    subject: "Email verification",
                    html: verifyEmail({
                        name: merchant.name,
                        link: `${process.env.SITE}/verify/${merchant._id}`,
                        code: merchant.verifyId
                    })
                };
                mailgun.messages().send(mailgunData, (err, body)=>{});

                return res.redirect(`/verify/${merchant._id}`);
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO SEND VERIFICATION EMAIL";
                return res.redirect("/");
            });
    },

    verifyPage: function(req, res){
        return res.render("verifyPage/verify", {id: req.params.id});
    },

    verify: function(req, res){
        Merchant.findOne({_id: req.body.id})
            .then((merchant)=>{
                if(req.body.code !== merchant.verifyId){
                    req.session.error = "INCORRECT CODE";
                    
                    return res.redirect(`/verify/${merchant._id}`);
                }

                merchant.verifyId = undefined;
                merchant.status.splice(merchant.status.indexOf("unverified"), 1);

                const mailgunList = mailgun.lists("clientsupport@mail.thesubline.com");
                const memberData = {
                    subscribed: true,
                    address: merchant.email,
                    name: merchant.name,
                    vars: {}
                }
                mailgunList.members().create(memberData, (err, data)=>{});

                return merchant.save();
            })
            .then((merchant)=>{
                req.session.user = merchant._id;

                return res.redirect("/dashboard");
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO VERIFY EMAIL ADDRESS";

                return res.redirect("/");
            });
    }
}