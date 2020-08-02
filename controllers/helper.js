const axios = require("axios");

module.exports = {
    getSquareData: function(merchant){
        let now = new Date().toISOString();
        now = `${now.substring(0, now.length - 1)}+00:00`;
        let before = new Date(merchant.lastUpdatedTime).toISOString();
        before = `${before.substring(0, before.length - 1)}+00:00`;

        axios.post(`${process.env.SQUARE_ADDRESS}/v2/orders/search`, {
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
                if(response.data.orders){
                    console.log(response.data.orders[0].line_items);
                    for(let i = 0; i < response.data.orders.length; i++){
                        for(let j = 0; j < merchant.recipes.length; j++){
                            if(response.data.orders[i].name === merchant.recipes[j].name){
                                
                                break;
                            }
                        }
                    }
                }
            })
            .catch((err)=>{
                console.log(err);
                // console.log(err.response.data.errors);
            });
    }
}