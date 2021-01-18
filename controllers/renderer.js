const ObjectId = require("mongoose").Types.ObjectId;

const Merchant = require("../models/merchant.js");
const Transaction = require("../models/transaction.js");
const Activity = require("../models/activity.js");

const helper = require("./helper.js");

module.exports = {
    /*
    GET - Shows the public landing page
    Return = a single error message (only if there is an error)
    Renders landingPage
    */
    landingPage: function(req, res){
        new Activity({
            ipAddr: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            merchant: req.session.user,
            route: "landing",
            date: new Date()
        })
            .save()
            .catch(()=>{});

        let error = {};
        let isLoggedIn = req.session.isLoggedIn || false;
        if(req.session.error){
            error = req.session.error;
            req.session.error = undefined;
        }else{
            error = null;
        }
        if(req.session.success){
            success = req.session.success;
            req.session.success = undefined;
        }else{
            success = null;
        }

        return res.render("landingPage/landing", {error: error, success: success, isLoggedIn: isLoggedIn});
    },

    /*
    GET - Displays the main inventory page for merchants
    Returns = the logged in merchant and his/her data
    Renders inventoryPage
    */
    displayDashboard: function(req, res){
        if(!req.session.user){
            req.session.error = "MUST BE LOGGED IN TO DO THAT";
            return res.redirect("/");
        }
        
        new Activity({
            ipAddr: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            merchant: req.session.user,
            route: "dashboard",
            date: new Date()
        })
            .save()
            .catch(()=>{});


        let merchant2 = {};
        // Merchant.findOne(
        //     {_id: res.locals.merchant._id},
        //     {
        //         name: 1,
        //         pos: 1,
        //         posId: 1,
        //         posAccessToken: 1,
        //         lastUpdatedTime: 1,
        //         inventory: 1,
        //         recipes: 1,
        //         squareLocation: 1,
        //         status: 1
        //     }
        // )
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
                if(err === "unverified"){
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