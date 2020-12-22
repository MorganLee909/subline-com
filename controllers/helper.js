const axios = require("axios");

const Transaction = require("../models/transaction.js");

module.exports = {
    getCloverData: async function(merchant){
        const subscriptionCheck = axios.get(`${process.env.CLOVER_ADDRESS}/v3/apps/${process.env.SUBLINE_CLOVER_APPID}/merchants/${merchant.posId}/billing_info?access_token=${merchant.posAccessToken}`);
        const transactionRetrieval = axios.get(`${process.env.CLOVER_ADDRESS}/v3/merchants/${merchant.posId}/orders?filter=modifiedTime>=${merchant.lastUpdatedTime}&expand=lineItems&expand=payment&access_token=${merchant.posAccessToken}`);
        await Promise.all([subscriptionCheck, transactionRetrieval])
            .then((response)=>{
                if(response[0].data.status !== "ACTIVE"){
                    req.session.error = "SUBSCRIPTION EXPIRED.  PLEASE RENEW ON CLOVER";
                    return res.redirect("/");
                }

                const updatedTime = Date.now();
                
                //Create Subline transactions from Clover Transactions
                let transactions = [];
                for(let i = 0; i < response[1].data.elements.length; i++){
                    let order = response[1].data.elements[i];
                    if(order.paymentState !== "PAID"){
                        break;
                    }
                    let newTransaction = new Transaction({
                        merchant: merchant._id,
                        date: new Date(order.createdTime),
                        device: order.device.id,
                        posId: order.id
                    });

                    //Go through lineItems from Clover
                    //Get the appropriate recipe from Subline
                    //Add it to the transaction or increment if existing
                    for(let j = 0; j < order.lineItems.elements.length; j++){
                        let recipe = {}
                        for(let k = 0; k < merchant.recipes.length; k++){
                            if(merchant.recipes[k].posId === order.lineItems.elements[j].item.id){
                                recipe = merchant.recipes[k];
                                break;
                            }
                        }

                        if(recipe){
                            let isNewRecipe = true;
                            for(let k = 0; k < newTransaction.recipes.length; k++){
                                if(newTransaction.recipes[k].recipe === recipe._id){
                                    newTransaction.recipes[k].quantity++;
                                    isNewRecipe = false;
                                    break;
                                }
                            }

                            if(isNewRecipe){
                                newTransaction.recipes.push({
                                    recipe: recipe._id,
                                    quantity: 1
                                });
                            }

                            //Subtract ingredients from merchants total for each ingredient in a recipe
                            for(let k = 0; k < recipe.ingredients.length; k++){
                                let inventoryIngredient = {};
                                for(let l = 0; l < merchant.inventory.length; l++){
                                    if(merchant.inventory[l].ingredient._id.toString() === recipe.ingredients[k].ingredient._id.toString()){
                                        inventoryIngredient = merchant.inventory[l];
                                        break;
                                    }
                                }
                                inventoryIngredient.quantity = inventoryIngredient.quantity - ingredient.quantity;
                            }
                        }
                    }

                    transactions.push(newTransaction);
                }

                merchant.lastUpdatedTime = updatedTime;

                //Remove any existing orders so that they can be replaced
                let ids = [];
                for(let i = 0; i < transactions.length; i++){
                    ids.push(transactions[i].posId);
                }
                Transaction.deleteMany({posId: {$in: ids}});

                return Transaction.create(transactions);
            })
            .catch((err)=>{
                req.session.error = "ERROR: UNABLE TO RETRIEVE DATA FROM CLOVER";
                return res.redirect("/");
            });
    },

    getSquareData: function(merchant){
        let now = new Date().toISOString();
        now = `${now.substring(0, now.length - 1)}+00:00`;
        let before = new Date(merchant.lastUpdatedTime).toISOString();
        before = `${before.substring(0, before.length - 1)}+00:00`;

        let ingredients = {};

        return axios.post(`${process.env.SQUARE_ADDRESS}/v2/orders/search`, {
            location_ids: [merchant.squareLocation],
            query: {
                filter: {
                    date_time_filter: {
                        closed_at: {
                            start_at: before,
                            end_at: now
                        }
                    },
                    state_filter: {
                        states: ["COMPLETED"]
                    }
                },
                sort: {
                    sort_field: "CLOSED_AT",
                    sort_order: "DESC"
                }
            }
        }, {
            headers: {
                Authorization: `Bearer ${merchant.posAccessToken}`
            }
        })
            .then((response)=>{
                let transactions = [];

                if(response.data.orders){
                    for(let i = 0; i < response.data.orders.length; i++){
                        let transaction = new Transaction({
                            merchant: merchant,
                            date: response.data.orders[i].created_at,
                            posId: response.data.orders[i].id,
                            recipes: []
                        });

                        for(let j = 0; j < response.data.orders[i].line_items.length; j++){
                            for(let k = 0; k < merchant.recipes.length; k++){
                                if(response.data.orders[i].line_items[j].catalog_object_id === merchant.recipes[k].posId){
                                    let quantitySold = parseInt(response.data.orders[i].line_items[j].quantity);

                                    transaction.recipes.push({
                                        recipe: merchant.recipes[k],
                                        quantity: quantitySold
                                    });

                                    for(let l = 0; l < merchant.recipes[k].ingredients.length; l++){
                                        let ingredient = merchant.recipes[k].ingredients[l];
                                        let quantity = quantitySold * ingredient.quantity
                                        ingredients[ingredient.ingredient] = ingredients[ingredient.ingredient] + quantity || quantity;
                                    }

                                    break;
                                }
                            }
                        }

                        transactions.push(transaction);
                    }
                }

                return Transaction.create(transactions);
            })
            .then((transactions)=>{
                const keys = Object.keys(ingredients);
                for(let i = 0; i < keys.length; i++){
                    for(let j = 0; j < merchant.inventory.length; j++){
                        if(keys[i] === merchant.inventory[j].ingredient._id.toString()){
                            merchant.inventory[j].quantity -= ingredients[keys[i]];
                            break;
                        }
                    }
                }

                merchant.lastUpdatedTime = new Date();

                return transactions;
            })
            .catch((err)=>{
                return "ERROR: UNABLE TO UPDATE TRANSACTION DATA";
            });
    },

    convertQuantityToBaseUnit: function(quantity, unit){
        switch(unit){
            case "kg": return quantity * 1000;
            case "oz": return quantity * 28.3495;
            case "lb": return quantity * 453.5924;
            case "ml": return quantity / 1000;
            case "tsp": return quantity / 202.8842;
            case "tbsp": return quantity / 67.6278;
            case "ozfl": return quantity / 33.8141;
            case "cup": return quantity / 4.1667;
            case "pt": return quantity / 2.1134;
            case "qt": return quantity / 1.0567;
            case "gal": return quantity * 3.7854;
            case "mm": return quantity / 1000;
            case "cm": return quantity / 100;
            case "in": return quantity / 39.3701;
            case "ft": return quantity / 3.2808;
            default: return quantity;
        }
    },

    convertPrice: function(price, unit){
        switch(unit){
            case "g":return price; 
            case "kg": return price / 1000;
            case "oz": return price / 28.3495;
            case "lb": return price / 453.5924;
            case "ml": return price * 1000;
            case "l": return price;
            case "tsp": return price * 202.8842;
            case "tbsp": return price * 67.6278;
            case "ozfl": return price * 33.8141;
            case "cup": return price * 4.1667;
            case "pt": return price * 2.1134;
            case "qt": return price * 1.0567;
            case "gal": return price / 3.7854;
            case "mm": return price * 1000;
            case "cm": return price * 100;
            case "m": return price;
            case "in": return price * 39.3701;
            case "ft": return price * 3.2808;
            default: return price;
        }
    },

    generateId: function(length){
        let result = "";
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for(let i = 0; i < length; i++){
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        return result;
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
    },

    getUnitType: function(unit){
        let unitType = "";

        switch(unit){
            case "g": unitType = "mass"; break;
            case "kg": unitType = "mass"; break;
            case "oz": unitType = "mass"; break;
            case "lb": unitType = "mass"; break;
            case "ml": unitType = "volume"; break;
            case "l": unitType = "volume"; break;
            case "tsp": unitType = "volume"; break;
            case "tbsp": unitType = "volume"; break;
            case "ozfl": unitType = "volume"; break;
            case "cup": unitType = "volume"; break;
            case "pt": unitType = "volume"; break;
            case "qt": unitType = "volume"; break;
            case "gal": unitType = "volume"; break;
            case "mm": unitType = "length"; break;
            case "cm": unitType = "length"; break;
            case "m": unitType = "length"; break;
            case "in": unitType = "length"; break;
            case "ft": unitType = "length"; break;
            default: unitType = "other"; break;
        }

        return unitType;
    }
}