const Owner = require("../models/owner.js");
const Merchant = require("../models/merchant.js");

const mailgun = require("mailgun-js")({apiKey: process.env.MG_SUBLINE_APIKEY, domain: "mail.thesubline.net"});
const verifyEmail = require("../emails/verifyEmail.js");

module.exports = {
    sendVerifyEmail: function(req, res){
        Owner.findOne({_id: req.params.id})
            .then((owner)=>{
                const mailgunData = {
                    from: "The Subline <clientsupport@thesubline.net>",
                    to: owner.email,
                    subject: "Email verification",
                    html: verifyEmail({
                        name: owner.email,
                        link: `${process.env.SITE}/verify/${owner._id}/${owner.session.sessionId}`,
                    })
                };
                mailgun.messages().send(mailgunData, (err, body)=>{});


                return res.render(`verifyPage/verify`, {id: owner._id, email: owner.email, banner: res.locals.merchant});
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO SEND VERIFICATION EMAIL";
                return res.redirect("/");
            });
    },

    resendEmail: function(req, res){
        Merchant.findOne({email: req.body.email.toLowerCase()})
            .then((merchant)=>{
                if(merchant){
                    throw "USER WITH THIS EMAIL ADDRESS ALREADY EXISTS";
                }

                return Merchant.findOne({_id: req.body.id});
            })
            .then((merchant)=>{
                merchant.email = req.body.email.toLowerCase();

                return merchant.save();
            })
            .then((merchant)=>{
                return res.redirect(`/verify/email/${merchant._id}`);
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
        Merchant.findOne({_id: req.params.id})
            .then((merchant)=>{
                if(req.params.code !== merchant.session.sessionId){
                    throw "UNABLE TO VERIFY EMAIL ADDRESS.  INCORRECT LINK";
                }

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
                req.session.success = "EMAIL VERIFIED.  PLEASE LOG IN";

                return res.redirect("/login");
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    req.session.error = err;
                }else{
                    req.session.error = "ERROR: UNABLE TO VERIFY EMAIL ADDRESS"
                }

                return res.redirect("/");
            });
    }
}