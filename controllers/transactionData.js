const Transaction = require("../models/transaction");

module.exports = {
    getTransactions: function(req, res){
        if(!req.session.user){
            req.session.error = "You must be logged in to view that page";
            return res.redirect("/");
        }

        let date = new Date();
        let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        Transaction.find({merchant: req.session.user})
            .then((transactions)=>{
                return res.json(transactions);
            })
            .catch((err)=>{
                return res.json("Error: could not retrieve sales data");
            });
    }
}

// {merchant: req.session.user, date: {$gte: firstDay, $lt: lastDay}}