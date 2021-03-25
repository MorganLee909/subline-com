const Owner = require("./models/owner.js");
const Merchant = require("./models/merchant.js");

const helper = require("./controllers/helper.js");

module.exports = {
    verifySession: function(req, res, next){
        if(req.session.owner === undefined) {
            req.session.error = "PLEASE LOG IN";
            return res.redirect("/login");
        }
    
        let owner = Owner.findOne({"session.sessionId": req.session.owner});
        let merchant = Merchant.findOne({_id: req.session.merchant});
        Promise.all([owner, merchant])
            .then((response)=>{
                if(response[0] === null || response[1] === null) throw "login";
                if(response[0]._id.toString() !== response[1].owner.toString()) throw "login";
    
                //Check if session is out of date
                if(response[0].session.expiration < new Date()){
                    let newExpiration = new Date();
                    newExpiration.setDate(newExpiration.getDate() + 90);
    
                    response[0].session.sessionId = helper.generateId(25);
                    response[0].session.expiration = newExpiration;
                    response[0].save();
                    throw "login";
                }

                res.locals.owner = response[0];
                res.locals.merchant = response[1];
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

