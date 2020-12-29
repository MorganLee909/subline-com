const Transaction = require("../models/transaction");
const Merchant = require("../models/merchant");

const helper = require("./helper.js");

const ObjectId = require("mongoose").Types.ObjectId;
const xlsx = require("xlsx");
const fs = require("fs");

module.exports = {
    /*
    POST - retrieves a list of transactions based on the filter
    req.body = {
        from: starting date to filter on,
        to: ending date to filter on,
        recipes: list of recipes to filter on
    }
    */
    getTransactions: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }
        console.log(req.body);

        let from = new Date(req.body.from);
        let to = new Date(req.body.to);

        let objectifiedRecipes = [];
        let query = {};
        if(req.body.recipes.length === 0){
            query = {$ne: false};
        }else{
            for(let i = 0; i < req.body.recipes.length; i++){
                objectifiedRecipes.push(new ObjectId(req.body.recipes[i]));
            }

            query = {
                $elemMatch: {
                    recipe: {
                        $in: objectifiedRecipes
                    }
                }
            }
        }

        console.log(query);

        Transaction.aggregate([
            {$match: {
                merchant: ObjectId(req.session.user),
                date: {
                    $gte: from,
                    $lt: to
                },
                recipes: query
            }},
            {$sort: {date: -1}}
        ])
            .then((transactions)=>{
                return res.json(transactions);
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE YOUR TRANSACTIONS");
            });
    },

    /*
    POST - create a new transaction
    req.body = {
        date: date of the transaction,
        recipes: [{
            recipe: id of the recipe to add,
            quantity: quantity of the recipe sold (in main unit),
        }]
        ingredientUpdates: an object that contains all of the ingredients that
            need to be updated as well as the amount to change. 
            keys = id
            values = quantity to change in grams
    }
    */
    createTransaction: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }
        

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                let keys = Object.keys(req.body.ingredientUpdates);

                for(let i = 0; i < keys.length; i++){
                    for(let j = 0; j < merchant.inventory.length; j++){
                        if(merchant.inventory[j].ingredient._id.toString() === keys[i]){
                            merchant.inventory[j].quantity -= req.body.ingredientUpdates[keys[i]];

                            break;
                        }
                    }
                }

                return merchant.save();
            })
            .then((merchant)=>{
                if(req.body.date === null){
                    throw "NEW TRANSACTIONS MUST CONTAIN A DATE";
                }

                return new Transaction({
                    merchant: req.session.user,
                    date: new Date(req.body.date),
                    device: "none",
                    recipes: req.body.recipes
                }).save();
            })
            .then((response)=>{
                return res.json(response);
            })
            .catch((err)=>{
                if(typeof(err) === "string"){
                    return res.json(err);
                }
                if(err.name === "ValidationError"){
                    return res.json(err.errors[Object.keys(err.errors)[0]].properties.message);
                }
                return res.json("ERROR: UNABLE TO CREATE NEW TRANSACTION");
            });
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
            if(str === "transaction" || str === "transactions"){
                sheet = workbook.Sheets[sheets[i]];
            }
        }

        let spreadsheetDate = {};
        let keys = Object.keys(workbook.Sheets.Transaction);
        for(let i = 0; i < keys.length; i++){
            if(keys[i][0] === "!"){
                continue;
            }

            if(workbook.Sheets.Transaction[keys[i]].w.toLowerCase() === "date"){
                spreadsheetDate = new Date(workbook.Sheets.Transaction[`${keys[i][0]}2`].w);
                let serverOffset = new Date().getTimezoneOffset();
                spreadsheetDate.setMinutes(spreadsheetDate.getMinutes()  - serverOffset);
                spreadsheetDate.setMinutes(spreadsheetDate.getMinutes() + parseFloat(req.body.timeOffset));

                break;
            }
        }

        const array = xlsx.utils.sheet_to_json(sheet, {
            header: 1
        });

        let locations = {};
        for(let i = 0; i < array[0].length; i++){
            if(array[0][i] === undefined){
                continue;
            }

            switch(array[0][i].toLowerCase()){
                case "date": locations.date = i; break;
                case "recipes": locations.recipes = i; break;
                case "quantity": locations.quantity = i; break;
            }
        }

        Merchant.findOne({_id: req.session.user})
            .populate("recipes")
            .populate("inventory.ingredient")
            .then((merchant)=>{
                let transaction = new Transaction({
                    merchant: req.session.user,
                    date: spreadsheetDate,
                    recipes: []
                });
                
                let ingredients = [];
                for(let i = 1; i < array.length; i++){
                    if(
                        array[i][locations.recipes] === undefined || 
                        array[i][locations.quantity] === 0 ||
                        array[i][locations.quantity] === undefined
                    ){
                        continue;
                    }

                    let exists = false;
                    for(let j = 0; j < merchant.recipes.length; j++){
                        if(merchant.recipes[j].name.toLowerCase() === array[i][locations.recipes].toLowerCase()){
                            transaction.recipes.push({
                                recipe: merchant.recipes[j],
                                quantity: array[i][locations.quantity]
                            });

                            for(let k = 0; k < merchant.recipes[j].ingredients.length; k++){
                                ingredients.push({
                                    id: merchant.recipes[j].ingredients[k].ingredient,
                                    quantity: array[i][locations.quantity] * merchant.recipes[j].ingredients[k].quantity
                                });
                            }

                            exists = true;
                            break;
                        }
                    }

                    if(exists !== true){
                        throw `COULD NOT FIND RECIPE ${array[i][locations.recipes]}`;
                    }
                }

                for(let i = 0; i < ingredients.length; i++){
                    for(let j = 0; j < merchant.inventory.length; j++){
                        
                        if(merchant.inventory[j].ingredient._id.toString() === ingredients[i].id.toString()){
                            merchant.inventory[j].quantity -= ingredients[i].quantity;

                            break;
                        }
                    }
                }

                return Promise.all([transaction.save(), merchant.save()]);
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
                return res.json("ERROR: UNABLE TO CREATE YOUR TRANSACTION");
            });
    },

    spreadsheetTemplate: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        Merchant.findOne({_id: req.session.user})
            .populate("recipes")
            .then((merchant)=>{
                let workbook = xlsx.utils.book_new();
                workbook.SheetNames.push("Transaction");
                let workbookData = [];
                let now = new Date().toISOString();

                workbookData.push(["Date", "Recipes", "Quantity"]);
                workbookData.push([now.slice(0, 10), merchant.recipes[0].name, 0]);

                for(let i = 1; i < merchant.recipes.length; i++){
                    workbookData.push(["", merchant.recipes[i].name, 0]);
                }

                workbook.Sheets.Transaction = xlsx.utils.aoa_to_sheet(workbookData);
                xlsx.writeFile(workbook, "SublineTransaction.xlsx");
                return res.download("SublineTransaction.xlsx", (err)=>{
                    fs.unlink("SublineTransaction.xlsx", ()=>{});
                });
            })
            .catch((err)=>{});
    },

    /*
    DELETE - Remove a transaction from the database
    */
    remove: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        let merchant = {};
        let transaction = {};
        Merchant.findOne({_id: req.session.user})
            .then((response)=>{
                merchant = response;
                return Transaction.findOne({_id: req.params.id}).populate("recipes.recipe");
            })
            .then((response)=>{
                transaction = response;
                return Transaction.deleteOne({_id: req.params.id});
            })
            .then((response)=>{
                res.json();

                for(let i = 0; i < transaction.recipes.length; i++){
                    const recipe = transaction.recipes[i].recipe;
                    for(let j = 0; j < recipe.ingredients.length; j++){
                        const ingredient = recipe.ingredients[j].ingredient;
                        for(let k = 0; k < merchant.inventory.length; k++){
                            if(ingredient.toString() === merchant.inventory[k].ingredient.toString()){
                                merchant.inventory[k].quantity += recipe.ingredients[j].quantity * transaction.recipes[i].quantity;
                                break;
                            }
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
                return res.json("ERROR: UNABLE TO DELETE THE TRANSACTION");
            });
    },

    /*
    GET - get transactions between two dates, sorted and group by date
    params:
        from: Date string
        to: Date string
    return:
        [{
            date: Date
            transactions:[[Recipe]]
        }]
    */
    getTransactionsByDate: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }

        const from = new Date(req.params.from);
        const to = new Date(req.params.to);

        Transaction.aggregate([
            {$match: {
                merchant: ObjectId(req.session.user),
                date: {
                    $gte: from,
                    $lt: to
                }
            }},
            {$sort: {
                date: 1
            }}
        ])
            .then((transactions)=>{
                return res.json(transactions);
            })
            .catch((err)=>{
                return res.json("ERROR: UNABLE TO RETRIEVE DATA");
            });
    },

    /*
    GET - Creates 5000 transactions for logged in merchant for testing
    */
    populate: function(req, res){
        if(!req.session.user){
            res.session.error = "Must be logged in to do that";
            return res.redirect("/");
        }

        function randomDate() {
            let now = new Date();
            let start = new Date();
            start.setFullYear(now.getFullYear() - 1);
            return new Date(start.getTime() + Math.random() * (now.getTime() - start.getTime()));
        }

        Merchant.findOne({_id: req.session.user})
            .then((merchant)=>{
                let newTransactions = [];

                for(let i = 0; i < 5000; i++){
                    let newTransaction = new Transaction({
                        merchant: merchant._id,
                        date: randomDate(),
                        recipes: []
                    });

                    let numberOfRecipes = Math.floor((Math.random() * 5) + 1);

                    for(let j = 0; j < numberOfRecipes; j++){
                        let recipeNumber = Math.floor(Math.random() * merchant.recipes.length);
                        let randQuantity = Math.floor((Math.random() * 3) + 1);

                        newTransaction.recipes.push({
                            recipe: merchant.recipes[recipeNumber],
                            quantity: randQuantity
                        });
                    }

                    newTransactions.push(newTransaction);
                }

                Transaction.create(newTransactions)
                    .then((transactions)=>{
                        return res.redirect("/dashboard");
                    })
                    .catch((err)=>{
                        return;
                    });
            })
            .catch((err)=>{
                return;
            });
    }
}