const Order = require("../models/order.js");

module.exports = {
    getOrders: function(){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Order.aggregate([
            {$match: {merchant: req.session.user}},
            {$sort: {date: -1}},
            {$limit: 25}
        ]).toArray()
            .then((orders)=>{
                return res.json({orders});
            })
            .catch((err)=>{
                return res.json("Error: unable to retrieve your orders");
            });
    }
}