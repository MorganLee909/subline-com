const ObjectId = require("mongoose").Types.ObjectId;

const Transaction = require("../models/transaction.js");

const helper = require("./helper.js");

module.exports = {
    /*
    GET - Shows the public landing page
    */
    landingPage: function(req, res){
        return res.render("otherPages/landing", {banner: res.locals.banner});
    },

    //GET: Renders the login page
    loginPage: function(req, res){
        if(req.session.user !== undefined) return res.redirect("/dashboard");
        return res.render("otherPages/login", {banner: res.locals.banner});
    },

    //GET: Renders the registration page
    registerPage: function(req, res){
        return res.render("otherPages/register", {banner: res.locals.banner});
    },

    /*
    GET - Displays the main inventory page for merchants
    Returns = the logged in merchant and his/her data
    Renders inventoryPage
    */
    displayDashboard: function(req, res){
        if(res.locals.merchant.status.includes("unverified")) {
            req.session.error = "PLEASE VERIFY YOUR EMAIL ADDRESS";
            return res.redirect(`/verify/email/${res.locals.merchant._id}`);
        }

        res.locals.merchant
            .populate("inventory.ingredient")
            .populate("recipes")
            .execPopulate()
            .then((merchant)=>{
                let date = new Date();
                let firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);

                return Transaction.aggregate([
                    {$match: {
                        merchant: new ObjectId(res.locals.merchant._id),
                        date: {$gte: firstDay},
                    }},
                    {$sort: {date: -1}},
                    {$project: {
                        date: 1,
                        recipes: 1
                    }}
                ]);      
            })
            .then(async (transactions)=>{
                if(res.locals.pos !== "none"){
                    let latest = null;
                    if(transactions.length === 0){
                        let latestTransaction = await Transaction.find({merchant: res.locals.merchant._id}).sort({date: -1}).limit(1);
                        if(latestTransaction.length > 0) latest = new Date(latest[0].date);
                    }else{
                        latest = new Date(transactions[0].date);
                    }

                    let newRecipes = {};
                    if(latest !== null){
                        newRecipes = await helper.getSquareData(res.locals.merchant, latest);
                        newRecipes = newRecipes.concat(transactions);                        
                        transactions = newRecipes;
                    }
                }

                res.locals.merchant._id = undefined;
                res.locals.password = undefined;
                res.locals.merchant.status = undefined;
                res.locals.square = undefined;
                res.locals.session = undefined;

                return res.render("dashboardPage/dashboard", {merchant: res.locals.merchant, transactions: transactions});
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO RETRIEVE DATA";
                return res.redirect("/");
            });
    },

    //GET - Renders the page to reset your password
    displayPassReset: function(req, res){
        return res.render("passResetPage/passReset");
    }
}