const Order = require("../models/order.js");
const Merchant = require("../models/merchant.js");

module.exports = {
    getOrders: function(){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        Order.aggregate([
            {$match: {merchant: req.session.user}},
            {$sort: {date: -1}},
            {$limit: 25},
            {$project: {
                orderId: 1,
                date: 1,
                ingredients: 1
            }}
        ]).toArray()
            .then((orders)=>{
                return res.json({orders});
            })
            .catch((err)=>{
                return res.json("Error: unable to retrieve your orders");
            });
    },

    /*
    POST - Creates a new order from the site
    req.body = {
        orderId: user created order id
        date: creation date
        ingredients: [{
            ingredient: id of the ingredient
            quantity: amount of the ingredient purchased
            price: price per unit for ingredient
        }]
    } 
    */ 
    createOrder: function(req, res){
        if(!req.session.user){
            req.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        let newOrder = new Order(req.body);
        newOrder.merchant = req.session.user;
        newOrder.save()
            .then((response)=>{
                res.json({});
            })
            .catch((err)=>{
                return res.json("Error: unable to save the new order");
            });

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                for(let i = 0; i < req.body.ingredients.length; i++){
                    for(let j = 0; j < merchant.inventory.length; j++){
                        if(req.body.ingredients[i].ingredient === merchant.inventory[j].ingredient.toString()){
                            merchant.inventory[j].quantity += parseFloat(req.body.ingredients[i].quantity);
                        }
                    }
                }

                return merchant.save()
            })
            .then((merchant)=>{
                return;
            })
            .catch(()=>{});
    }
}