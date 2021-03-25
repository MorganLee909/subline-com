const Merchant = require("./models/merchant.js")

const helper = require("./controllers/helper.js");

module.exports = {
    verifySession: function(req, res, next){
        if(req.session.owner === undefined) {
            req.session.error = "PLEASE LOG IN";
            return res.redirect("/login");
        }
    
        Merchant.findOne({"session.sessionId": req.session.owner})
            .then((merchant)=>{
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

                res.locals.merchant = merchant;
                return next();
            })
            .catch((err)=>{
                if(err === "login"){
                    req.session.owner = undefined;
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

