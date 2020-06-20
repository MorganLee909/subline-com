const Merchant = require("../models/merchant.js");

module.exports = {
    merchant: async function(merchant){
        if(!this.isSanitary([merchant.name])){
            return "Name contains illegal characters";
        }

        if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(merchant.email)){
            return "Invalid email address";
        }

        let checkMerchant = await Merchant.findOne({email: merchant.email});

        if(checkMerchant){
            return "An account with that email address already exists";
        }

        if(merchant.password.length < 10){
            return "Password must contain at least 10 characters";
        }

        if(merchant.password !== merchant.confirmPassword){
            return "Passwords do not match";
        }

        return true;
    },

    ingredient: function(ingredient){
        if(!this.isSanitary([ingredient.name, ingredient.category, ingredient.unit])){
            return false;
        }

        return true;
    },

    quantity: function(num){
        if(isNaN(num) || num === ""){
            return false;
        }

        if(num < 0){
            return false;
        }

        return true;
    },

    isSanitary: function(strings){
        let disallowed = ["\\", "<", ">", "$", "{", "}", "(", ")"];

        for(let i = 0; i < strings.length; i++){
            for(let j = 0; j < disallowed.length; j++){
                if(strings[i].includes(disallowed[j])){
                    return false;
                }
            }
        }

        return true;
    }
}