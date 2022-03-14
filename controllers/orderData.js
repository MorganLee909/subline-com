const Order = require("../models/order.js");

const ObjectId = require("mongoose").Types.ObjectId;

module.exports = {
    
    /*
    GET: gets orders based on queries
    req.body = {
        from: Date (starting date/time)
        to: Date (ending date/time)
        ingredients: [id] (list of transactions to search for)
            empty list gets all
    }
    */
    getOrders: function(req, res){
        let from = new Date(req.body.from);
        let to = new Date(req.body.to);

        let match = {};
        let objectifiedIngredients = [];
        if(req.body.ingredients.length === 0){
            match = {$ne: false};
        }else{  
            for(let i = 0; i < req.body.ingredients.length; i++){
                objectifiedIngredients.push(new ObjectId(req.body.ingredients[i]));
            }

            match = {
                $elemMatch: {
                    ingredient: {
                        $in: objectifiedIngredients
                    }
                }
            }
        }

        Order.aggregate([
            {$match:{
                merchant: new ObjectId(res.locals.merchant._id),
                date: {
                    $gte: from,
                    $lt: to
                },
                ingredients: match
            }},
            {$sort: {date: -1}}
        ])
            .then((orders)=>{
                return res.json(orders);
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE DATA");
            });
    },

    /*
    POST - Creates a new order from the site
    req.body = {
        name: user created order id
        date: creation date
        ingredients: [{
            ingredient: id of the ingredient
            quantity: amount of the ingredient purchased
            pricePerUnit: price per gram
        }]
    } 
    */ 
    createOrder: function(req, res){
        console.log(req.body);
        let newOrder = new Order(req.body);
        newOrder.merchant = res.locals.merchant._id;
        newOrder.save()
            .then((response)=>{
                res.json(response);
            })
            .catch((err)=>{
                console.error(err);
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO SAVE ORDER");
            });

        
            for(let i = 0; i < req.body.ingredients.length; i++){
                for(let j = 0; j < res.locals.merchant.inventory.length; j++){
                    if(req.body.ingredients[i].ingredient === res.locals.merchant.inventory[j].ingredient.toString()){
                        res.locals.merchant.inventory[j].quantity += parseFloat(req.body.ingredients[i].quantity);
                    }
                }
            }

            res.locals.merchant.save().catch((err)=>{});
    },

    /*
    DELETE - Remove an order from the database
    */
    removeOrder: function(req, res){
        Order.findOne({_id: req.params.id})
            .then((order)=>{
                for(let i = 0; i < order.ingredients.length; i++){
                    for(let j = 0; j < res.locals.merchant.inventory.length; j++){
                        if(order.ingredients[i].ingredient.toString() === res.locals.merchant.inventory[j].ingredient.toString()){
                            res.locals.merchant.inventory[j].quantity -= order.ingredients[i].quantity;
                            break;
                        }
                    }
                }

                return Promise.all([Order.deleteOne({_id: req.params.id}), res.locals.merchant.save()]);
            })
            .then((response)=>{
                res.json({});
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO REMOVE ORDER");
            });
    }
}