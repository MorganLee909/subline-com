const Merchant = require("./models/merchant.js")

module.exports = function(req, res, next){
    if(req.session.user === undefined) {
        req.session.error = "PLEASE LOG IN";
        return res.redirect("/");
    }

    Merchant.findOne({"session.sessionId": req.session.user})
        .then((merchant)=>{
            if(merchant === null){
                throw "no merchant";
            }

            if(merchant.session.date < new Date()){
                let newExpiration = new Date();
                newExpiration.setDate(newExpiration.getDate() + 90);

                merchant.session.sessionId = helper.generateId(25);
                merchant.session.date = newExpiration;
                merchant.save();
                return res.redirect("/");
            }

            res.locals.merchant = merchant;
            return next();
        })
        .catch((err)=>{
            if(err === "no merchant"){
                req.session.error = "PLEASE LOG IN";
                return res.redirect("/");
            }
            return res.json("ERROR: UNABLE TO RETRIEVE DATA");
        });
}