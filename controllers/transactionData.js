const Transaction = require("../models/transaction");

const ObjectId = require("mongoose").Types.ObjectId;

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

        Transaction.aggregate([
            {$match: {
                merchant: ObjectId(res.locals.merchant._id),
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
                return res.json("ERROR: UNABLE TO RETRIEVE DATA");
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
        let keys = Object.keys(req.body.ingredientUpdates);

        for(let i = 0; i < keys.length; i++){
            for(let j = 0; j < res.locals.merchant.inventory.length; j++){
                if(res.locals.merchant.inventory[j].ingredient._id.toString() === keys[i]){
                    res.locals.merchant.inventory[j].quantity -= req.body.ingredientUpdates[keys[i]];

                    break;
                }
            }
        }

        res.locals.merchant.save()
            .then((merchant)=>{
                if(req.body.date === null){
                    throw "NEW TRANSACTIONS MUST CONTAIN A DATE";
                }

                return new Transaction({
                    merchant: res.locals.merchant._id,
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

    /*
    DELETE - Remove a transaction from the database
    */
    remove: function(req, res){
        Transaction.findOne({_id: req.params.id})
            .populate("recipes.recipe")
            .then((transaction)=>{
                for(let i = 0; i < transaction.recipes.length; i++){
                    const recipe = transaction.recipes[i].recipe;
                    for(let j = 0; j < recipe.ingredients.length; j++){
                        const ingredient = recipe.ingredients[j].ingredient;
                        for(let k = 0; k < res.locals.merchant.inventory.length; k++){
                            if(ingredient.toString() === res.locals.merchant.inventory[k].ingredient.toString()){
                                res.locals.merchant.inventory[k].quantity += recipe.ingredients[j].quantity * transaction.recipes[i].quantity;
                                break;
                            }
                        }
                    }
                }
                
                return Promise.all([Transaction.deleteOne({_id: req.params.id}), res.locals.merchant.save()]);
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
                return res.json("ERROR: UNABLE TO DELETE THE TRANSACTION");
            });
    },

    /*
    GET - Creates 5000 transactions for logged in merchant for testing
    */
    populate: function(req, res){
        function randomDate() {
            let now = new Date();
            let start = new Date();
            start.setFullYear(now.getFullYear() - 1);
            return new Date(start.getTime() + Math.random() * (now.getTime() - start.getTime()));
        }

        let newTransactions = [];
        for(let i = 0; i < 5000; i++){
            let newTransaction = new Transaction({
                merchant: res.locals.merchant._id,
                date: randomDate(),
                recipes: []
            });

            let numberOfRecipes = Math.floor((Math.random() * 5) + 1);

            for(let j = 0; j < numberOfRecipes; j++){
                let recipeNumber = Math.floor(Math.random() * res.locals.merchant.recipes.length);
                let randQuantity = Math.floor((Math.random() * 3) + 1);

                newTransaction.recipes.push({
                    recipe: res.locals.merchant.recipes[recipeNumber],
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
    }
}