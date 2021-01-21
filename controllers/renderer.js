const ObjectId = require("mongoose").Types.ObjectId;

const Transaction = require("../models/transaction.js");
const Activity = require("../models/activity.js");

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
        new Activity({
            ipAddr: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            merchant: res.locals.merchant._id,
            route: "dashboard",
            date: new Date()
        })
            .save()
            .catch(()=>{});


        let merchant2 = {};
        res.locals.merchant
            .populate("inventory.ingredient")
            .populate("recipes")
            .execPopulate()
            .then(async (merchant)=>{
                if(res.locals.merchant.status.includes("unverified")){
                    throw "unverified";
                }

                if(res.locals.merchant.pos === "clover"){
                    await helper.getCloverData(res.locals.merchant);
                }else if(res.locals.merchant.pos === "square"){
                    await helper.getSquareData(res.locals.merchant);
                }else{
                    return;
                }

                return res.locals.merchant.save();
            })
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
            .then((transactions)=>{
                res.locals.merchant._id = undefined;
                res.locals.merchant.posAccessToken = undefined;
                res.locals.merchant.lastUpdatedTime = undefined;
                res.locals.merchant.accountStatus = undefined;
                res.locals.merchant.status = undefined;

                return res.render("dashboardPage/dashboard", {merchant: res.locals.merchant, transactions: transactions});
            })
            .catch((err)=>{
                //TODO: add banners to the necessary pages
                if(err === "unverified"){
                    req.session.error = "PLEASE VERIFY YOUR EMAIL ADDRESS";
                    return res.redirect(`/verify/email/${merchant2._id}`);
                }
                req.session.error = "ERROR: UNABLE TO RETRIEVE USER DATA";
                return res.redirect("/");
            });
    },

    //GET - Renders the page to reset your password
    displayPassReset: function(req, res){
        return res.render("passResetPage/passReset");
    }
}