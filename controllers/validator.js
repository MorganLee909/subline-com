const Merchant = require("../models/merchant.js");

module.exports = {
    merchant: async function(merchant){
        if(!this.isSanitary([merchant.name])){
            return "NAME CONTAINS ILLEGAL CHARACTERS";
        }

        if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(merchant.email)){
            return "INVALID EMAIL ADDRESS";
        }

        let checkMerchant = await Merchant.findOne({email: merchant.email});

        if(checkMerchant){
            return "AN ACCOUNT WITH THAT EMAIL ADDRESS ALREADY EXISTS";
        }

        let checkPassword = this.password(merchant.password, merchant.confirmPassword);
        if(this.password(checkPassword !== true)){
            return checkPassword;
        }

        return true;
    },

    password: function(password, confirmPassword){
        if(password.length < 10){
            return "PASSWORD MUST CONTAIN AT LEAST 10 CHARACTERS";
        }

        if(password !== confirmPassword){
            return "PASSWORDS DO NOT MATCH";
        }

        return true;
    },

    quantity: function(num){
        if(isNaN(num) || num === ""){
            return "QUANTITY MUST BE A NUMBER";
        }

        if(num < 0){
            return "QUANTITY CANNOT BE A NEGATIVE NUMBER";
        }

        return true;
    },

    price: function(price){
        if(price < 0){
            return "PRICE CANNOT BE A NEGATIVE NUMBER";
        }

        if(isNaN(price) || price === ""){
            return "PRICE MUST BE A NUMBER";
        }

        return true;
    },

    /*
    ingredient = {
        name: required,
        category: required,
        unit: required,
        quantity: required,
        specialUnit: optional,
        unitSize: optional
    }
    */
    ingredient: function(ingredient){
        if(!this.isSanitary([ingredient.name, ingredient.category])){
            return "INGREDIENT CONTAINS ILLEGAL CHARACTERS";
        }

        if(ingredient.specialUnit === "bottle"){
            let quantityCheck = this.quantity(ingredient.unitSize);
            if(quantityCheck !== true){
                return "BOTTLE SIZE MUST BE A NON-NEGATIVE NUMBER";
            }
        }

        return true;
    },

    recipe: function(recipe){
        if(!this.isSanitary([recipe.name])){
            return "INGREDIENT CONTAINS ILLEGAL CHARACTERS";
        }

        let priceCheck = this.price(recipe.price);
        if(priceCheck !== true){
            return priceCheck;
        }

        for(let i = 0; i < recipe.ingredients.length; i++){
            let checkQuantity = this.quantity(recipe.ingredients[i].quantity);
            if(checkQuantity !== true){
                return checkQuantity;
            }
        }

        for(let i = 0; i < recipe.ingredients.length; i++){
            for(let j = i + 1; j < recipe.ingredients.length; j++){
                if(recipe.ingredients[i].ingredient === recipe.ingredients[j].ingredient){
                    return "RECIPE CANNOT CONTAIN DUPLICATE INGREDIENTS";
                }
            }
        }

        return true;
    },

    order: function(order){
        if(!this.isSanitary([order.name])){
            return "ORDER NAME CONTAINS ILLEGAL CHARACTERS";
        }

        if(new Date(order.date) > new Date()){
            return "DATE CANNOT BE IN THE FUTURE";
        }

        if(this.quantity(order.taxes) !== true){
            return "TAXES MUST BE A NON NEGATIVE NUMBER";
        }

        if(this.quantity(order.fees) !== true){
            return "FEES MUST BE A NON NEGATIVE NUMBER";
        }

        for(let i = 0; i < order.ingredients; i++){
            let quantityCheck = this.quantity(order.ingredients[i].quantity);
            if(quantityCheck !== true){
                return quantityCheck;
            }

            let priceCheck = this.price(order.ingredients[i].price);
            if(priceCheck !== true){
                return priceCheck;
            }
        }

        return true;
    }
}