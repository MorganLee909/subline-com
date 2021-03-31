const Owner = require("../models/owner.js");

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
                        name: owner.name,
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
                if(req.params.code !== owner.session.sessionId){
                    throw "UNABLE TO VERIFY EMAIL ADDRESS.  INCORRECT LINK";
                }

                owner.status.splice(owner.status.indexOf("unverified"), 1);

                const mailgunList = mailgun.lists("clientsupport@mail.thesubline.com");
                const memberData = {
                    subscribed: true,
                    address: owner.email,
                    name: owner.name,
                    vars: {}
                }
                mailgunList.members().create(memberData, (err, data)=>{});

                return owner.save();
            })
            .then((owner)=>{
                req.session.success = "EMAIL VERIFIED. PLEASE LOG IN";

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