const Merchant = require("../models/merchant.js");
const fs = require("fs");

module.exports = {
    /*
    POST: Adding data for admins
    req.body = {
        password: String
        id: String <merchant id>
    }
    req.files = {
        ingredients: txt
        recipes: txt 
    }
    */
    addData: function(req, res){
        if(req.body.password !== process.env.ADMIN_PASS) return res.json("bad password");

        Merchant.findOne({_id: req.body.id})
            .then((merchant)=>{
                let data = fs.readFileSync(req.files.ingredients.tempFilePath).toString();
                data = data.split("/n");

                console.log(data);
            })
            .catch((err)=>{
                return res.json("ERROR: A whoopsie has been made");
            });
    }
}