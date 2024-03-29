const axios = require("axios");

const Transaction = require("../models/transaction.js");
const Recipe = require("../models/recipe.js");

module.exports = {
    getSquareData: function(owner, merchant, data){
        let ingredients = {};

        return axios.post(`${process.env.SQUARE_ADDRESS}/v2/orders/search`, data, {
            headers: {Authorization: `Bearer ${owner.square.accessToken}`}
        })
            .then((response)=>{
                let transactions = [];

                if(response.data.orders){
                    for(let i = 0; i < response.data.orders.length; i++){
                        let transaction = new Transaction({
                            merchant: merchant._id,
                            date: response.data.orders[i].created_at,
                            posId: response.data.orders[i].id,
                            recipes: []
                        });

                        if(response.data.orders[i].line_items === undefined) continue;
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

                    return Transaction.create(transactions);
                }

                return [];
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
                return "ERROR: UNABLE TO UPDATE DATA";
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

    createRecipesFromSquare: function(squareItems, categories, merchantId){
        let recipes = [];

        for(let i = 0; i < squareItems.length; i++){
            if(squareItems[i].item_data.variations.length > 1){
                for(let j = 0; j < squareItems[i].item_data.variations.length; j++){
                    let item = squareItems[i].item_data.variations[j];
                    let price = 0;
                    if(item.item_variation_data.price_money !== undefined) price = item.item_variation_data.price_money.amount;
                    let recipe = new Recipe({
                        posId: item.id,
                        merchant: merchantId,
                        name: `${squareItems[i].item_data.name} '${item.item_variation_data.name}'`,
                        price: price,
                        category: ""
                    });

                    for(let k = 0; k < categories.length; k++){
                        if(squareItems[i].item_data.category_id === categories[k].id){
                            recipe.category = categories[k].category_data.name;
                            break;
                        }
                    }

                    recipes.push(recipe);
                }
            }else{
                let priceMoney = squareItems[i].item_data.variations[0].item_variation_data.price_money;
                let price = (priceMoney === undefined) ? 0 : priceMoney.amount;

                let recipe = new Recipe({
                    posId: squareItems[i].item_data.variations[0].id,
                    merchant: merchantId,
                    name: squareItems[i].item_data.name,
                    price: price,
                    ingredients: [],
                    category: ""
                });
                
                for(let j = 0; j < categories.length; j++){
                    if(squareItems[i].item_data.category_id === categories[j].id){
                        recipe.category = categories[j].category_data.name;
                        break;
                    }
                }

                recipes.push(recipe);
            }
        }

        return recipes;
    },

    getAllMerchantTransactions: async function(merchant, token){
        let body = {
            location_ids: [merchant.locationId],
            limit: 10000,
            query: {}
        };

        let options = {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        };

        do{
            let response = await axios.post(`${process.env.SQUARE_ADDRESS}/v2/orders/search`, body, options);
            if(response.data.orders === undefined) break;
            body.cursor = response.data.cursor;

            let transactions = [];
            
            for(let i = 0; i < response.data.orders.length; i++){
                let transaction = new Transaction({
                    merchant: merchant._id,
                    date: new Date(response.data.orders[i].created_at),
                    posId: response.data.orders[i].id,
                    recipes: []
                });

                if(response.data.orders[i].line_items === undefined) continue;
                for(let j = 0; j < response.data.orders[i].line_items.length; j++){
                    let item = response.data.orders[i].line_items[j];

                    for(let k = 0; k < merchant.recipes.length; k++){
                        if(merchant.recipes[k].posId === item.catalog_object_id){
                            transaction.recipes.push({
                                recipe: merchant.recipes[k]._id,
                                quantity: parseInt(item.quantity)
                            });
                        }
                    }
                }

                transactions.push(transaction);
            }

            Transaction.create(transactions);
        }while(body.cursor !== undefined);
    }
}