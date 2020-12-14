const Order = require("../models/order.js");
const Merchant = require("../models/merchant.js");

const helper = require("./helper.js");

const ObjectId = require("mongoose").Types.ObjectId;
const xlsx = require("xlsx");
const fs = require("fs");
const { base } = require("../models/merchant.js");

module.exports = {
    /*
    GET - get the 25 most recent orders
    return = [
        _id: id of order,
        name: user created id for order,
        date: date order was created,
        ingredients: [{
            _id: unused id of this object,
            ingredient: id of the ingredient,
            price: price per unit of the ingredient,
            quantity: quantity of ingredient in this order
        }]
    ]
    */
    getOrders: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        Order.aggregate([
            {$match: {merchant: ObjectId(req.session.user)}},
            {$sort: {date: -1}},
            {$limit: 25},
            {$project: {
                name: 1,
                date: 1,
                taxes: 1,
                fees: 1,
                ingredients: 1
            }}
        ])
            .then((orders)=>{
                return res.json(orders);
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO RETRIEVE YOUR ORDERS");
            });
    },

    /*
    POST - retrieves a list of transactions based on the filter
    req.body = {
        startDate: starting date to filter on,
        endDate: ending date to filter on,
        ingredients: list of recipes.to filter on
    }
    */
    orderFilter: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let objectifiedIngredients = [];
        for(let i = 0; i < req.body.ingredients.length; i++){
            objectifiedIngredients.push(new ObjectId(req.body.ingredients[i]));
        }
        let startDate = new Date(req.body.startDate);
        let endDate = new Date(req.body.endDate);
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);
        Order.aggregate([
            {$match: {
                merchant: new ObjectId(req.session.user),
                date: {
                    $gte: startDate,
                    $lt: endDate
                },
                ingredients: {
                    $elemMatch: {
                        ingredient: {
                            $in: objectifiedIngredients
                        }
                    }
                }
            }},
            {$sort: {date: -1}}
        ])
            .then((orders)=>{
                return res.json(orders);
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO RETRIEVE YOUR TRANSACTIONS");
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
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }
        console.log(req.body);

        let newOrder = new Order(req.body);
        newOrder.merchant = req.session.user;
        newOrder.save()
            .then((response)=>{
                res.json(response);
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO SAVE ORDER");
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

                return merchant.save();
            })
            .then((merchant)=>{
                return;
            })
            .catch(()=>{});
    },

    createFromSpreadsheet: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        //read file, get the correct sheet, create array from sheet
        let workbook = xlsx.readFile(req.file.path);
        fs.unlink(req.file.path, ()=>{});

        let sheets = Object.keys(workbook.Sheets);
        let sheet = {};
        for(let i = 0; i < sheets.length; i++){
            let str = sheets[i].toLowerCase();
            if(str === "order" || str === "orders"){
                sheet = workbook.Sheets[sheets[i]];
            }
        }

        const array = xlsx.utils.sheet_to_json(sheet, {
            header: 1
        });

        //get property locations
        let locations = {};
        for(let i = 0; i < array[0].length; i++){
            switch(array[0][i].toLowerCase()){
                case "name": locations.name = i; break;
                case "date": locations.date = i; break;
                case "taxes": locations.taxes = i; break;
                case "fees": locations.fees = i; break;
                case "ingredients": locations.ingredients = i; break;
                case "quantity": locations.quantity = i; break;
                case "price": locations.price = i; break;
            }
        }

        let merchant = {};
        Merchant.findOne({_id: req.session.user})
            .populate("inventory.ingredient")
            .then((response)=>{
                merchant = response;

                let orders = [];
                let currentOrder = {};
                for(let i = 1; i < array.length; i++){
                    if(array[i].length === 0 || array[i][locations.ingredients] === undefined || array[i][locations.quantity === 0]){
                        continue;
                    }

                    if(array[i][locations.name] !== undefined){
                        currentOrder = {
                            merchant: req.session.user,
                            name: array[i][locations.name],
                            taxes: parseInt(array[i][locations.taxes] * 100),
                            fees: parseInt(array[i][locations.fees] * 100),
                            ingredients: []
                        }

                        if(array[i][locations.date] === undefined){
                            currentOrder.date = new Date();
                        }else{
                            currentOrder.date = new Date(array[i][locations.date]);
                        }

                        orders.push(currentOrder);
                    }

                    let exists = false;
                    for(let j = 0; j < merchant.inventory.length; j++){
                        if(merchant.inventory[j].ingredient.name.toLowerCase() === array[i][locations.ingredients].toLowerCase()){
                            let baseQuantity = 0;
                            if(merchant.inventory[j].ingredient.specialUnit === "bottle"){
                                baseQuantity = array[i][locations.quantity] * merchant.inventory[j].ingredient.unitSize * 1000;
                                currentOrder.ingredients.push({
                                    ingredient: merchant.inventory[j].ingredient._id,
                                    quantity: baseQuantity,
                                    pricePerUnit: (array[i][locations.price] * 100) / merchant.inventory[j].ingredient.unitSize / 1000
                                });
                            }else{
                                baseQuantity = helper.convertQuantityToBaseUnit(array[i][locations.quantity], merchant.inventory[j].defaultUnit);
                                currentOrder.ingredients.push({
                                    ingredient: merchant.inventory[j].ingredient._id,
                                    quantity: baseQuantity,
                                    pricePerUnit: helper.convertPrice(array[i][locations.price] * 100, merchant.inventory[j].defaultUnit)
                                });
                            }

                            merchant.inventory[j].quantity += baseQuantity;

                            exists = true;
                            break;
                        }
                    }

                    if(exists === false){
                        throw `CANNOT FIND INGREDIENT ${array[i][locations.ingredients]} FROM ORDER ${array[i][locations.name]}`;
                    }
                }

                return Promise.all([Order.create(orders), merchant.save()]);
            })
            .then((response)=>{
                return res.json(response[0]);
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO CREATE YOUR ORDERS");
            });
    },

    /*
    GET - Creates and sends a template xlsx for uploading orders
    */
    spreadsheetTemplate: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .populate("inventory.ingredient")
            .then((merchant)=>{
                let workbook = xlsx.utils.book_new();
                workbook.SheetNames.push("Order");
                let workbookData = [];
                let now = new Date().toISOString();

                workbookData.push(["Name", "Date", "Taxes", "Fees", "Ingredients", "Quantity", "Price", "<- Price Per Unit"]);
                workbookData.push([
                    "<<Order Name>>",
                    now.slice(0, 10),
                    0,
                    0,
                    merchant.inventory[0].ingredient.name,
                    0,
                    0
                ]);

                for(let i = 1; i < merchant.inventory.length; i++){
                    workbookData.push(["", "", "", "", merchant.inventory[i].ingredient.name, 0, 0]);
                }

                workbook.Sheets.Order = xlsx.utils.aoa_to_sheet(workbookData);
                xlsx.writeFile(workbook, "SublineOrder.xlsx");
                return res.download("SublineOrder.xlsx", (err)=>{
                    fs.unlink("SublineOrder.xlsx", ()=>{});
                });
            })
            .catch((err)=>{});
    },

    /*
    DELETE - Remove an order from the database
    */
    removeOrder: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let merchant = {};
        let order = {}
        Merchant.findOne({_id: req.session.user})
            .then((response)=>{
                merchant = response;
                return Order.findOne({_id: req.params.id});
            })
            .then((response)=>{
                order = response;

                return Order.deleteOne({_id: req.params.id})
            })
            .then((response)=>{
                res.json({});

                for(let i = 0; i < order.ingredients.length; i++){
                    for(let j = 0; j < merchant.inventory.length; j++){
                        if(order.ingredients[i].ingredient.toString() === merchant.inventory[j].ingredient.toString()){
                            merchant.inventory[j].quantity -= order.ingredients[i].quantity;
                            break;
                        }
                    }
                }

                return merchant.save();
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