const Owner = require("./models/owner.js");

const helper = require("./controllers/helper.js");

module.exports = {
    verifySession: function(req, res, next){
        if(req.session.owner === undefined) {
            req.session.error = "PLEASE LOG IN";
            return res.redirect("/login");
        }
    
        Owner.findOne({"session.sessionId": req.session.owner})
            .then((owner)=>{
                if(owner === null) throw "login";
    
                //Check if session is out of date
                if(owner.session.expiration < new Date()){
                    let newExpiration = new Date();
                    newExpiration.setDate(newExpiration.getDate() + 90);
    
                    owner.session.sessionId = helper.generateId(25);
                    owner.session.expiration = newExpiration;
                    owner.save();
                    throw "login";
                }

                res.locals.owner = owner;
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

