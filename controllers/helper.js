const axios = require("axios");

const Transaction = require("../models/transaction.js");
const { response } = require("express");

module.exports = {
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
                console.log(response.data.orders.length);
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

                return transactions;
            })
            .catch((err)=>{
                return "ERROR: UNABLE TO UPDATE TRANSACTION DATA";
            });
    }
}