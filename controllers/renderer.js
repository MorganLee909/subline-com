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
        if(req.session.owner !== undefined) return res.redirect("/dashboard");
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
        if(res.locals.owner.status.includes("unverified")) {
            req.session.error = "PLEASE VERIFY YOUR EMAIL ADDRESS";
            return res.redirect(`/verify/email/${res.locals.owner._id}`);
        }

        res.locals.merchant
            .populate("inventory.ingredient")
            .populate("recipes")
            .execPopulate()
            .then((merchant)=>{
                let date = new Date();
                let firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);

                let transactions = Transaction.aggregate([
                    {$match: {
                        merchant: new ObjectId(merchant._id),
                        date: {$gte: firstDay},
                    }},
                    {$sort: {date: -1}},
                    {$project: {
                        date: 1,
                        recipes: 1
                    }}
                ]);
                
                let merchants = res.locals.owner.populate("merchants", "name").execPopulate();

                return Promise.all([transactions, merchants]);
            })
            .then(async (response)=>{
                let transactions = response[0];

                if(res.locals.merchant.pos !== "none"){
                    let latest = null;
                    if(transactions.length === 0){
                        let latestTransaction = await Transaction.find({merchant: res.locals.merchant._id}).sort({date: -1}).limit(1);
                        if(latestTransaction.length > 0) latest = new Date(latest[0].date);
                    }else{
                        latest = new Date(transactions[0].date);
                    }

                    if(latest !== null){
                        latest.setMilliseconds(latest.getMilliseconds() + 1);
                        let now = new Date();

                        let postData = {
                            location_ids: [res.locals.merchant.locationId],
                            query: {
                                filter: {
                                    date_time_filter: {
                                        created_at: {
                                            start_at: latest,
                                            end_at: now
                                        }
                                    },
                                    state_filter: {
                                        states: ["COMPLETED"]
                                    }
                                },
                                sort: {
                                    sort_field: "CREATED_AT",
                                    sort_order: "DESC"
                                }
                            },
                            limit: 10000
                        };

                        do{
                            let newOrders = await helper.getSquareData(res.locals.owner, res.locals.merchant, postData);
                            postData.cursor = newOrders.cursor;
                            for(let i = 0; i < newOrders.length; i++){
                                for(let j = 0; j < newOrders[i].recipes.length; j++){
                                    newOrders[i].recipes[j].recipe = newOrders[i].recipes[j].recipe._id;
                                }
                            }
                            transactions = newOrders.concat(transactions);
                        }while(postData.cursor !== undefined);
                    }
                }

                res.locals.merchant.owner = undefined;
                res.locals.createdAt = undefined;
                
                res.locals.owner.password = undefined;
                res.locals.owner.status = undefined;
                res.locals.owner.square = undefined;
                res.locals.owner.createdAt = undefined;
                res.locals.owner.session = undefined;

                for(let i = 0; i < res.locals.owner.merchants.length; i++){
                    if(res.locals.owner.merchants[i]._id.toString() === res.locals.merchant._id.toString()){
                        res.locals.owner.merchants.splice(i, 1);
                        break;
                    }
                }

                return res.render("dashboardPage/dashboard", {owner: res.locals.owner, merchant: res.locals.merchant, transactions: transactions});
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