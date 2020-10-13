let orders = {
    orders: [],

    display: async function(Order, newOrders){
        if(newOrders){
            this.orders = newOrders;
        }
        if(this.orders.length === 0){
            this.orders = await this.getOrders(Order);
        }

        document.getElementById("orderFilterBtn").onclick = ()=>{controller.openSidebar("orderFilter")};
        document.getElementById("newOrderBtn").onclick = ()=>{controller.openSidebar("newOrder")};

        let orderList = document.getElementById("orderList");
        let template = document.getElementById("order").content.children[0];

        while(orderList.children.length > 0){
            orderList.removeChild(orderList.firstChild);
        }

        for(let i = 0; i < this.orders.length; i++){
            let orderDiv = template.cloneNode(true);
            orderDiv.order = this.orders[i];
            orderDiv.children[0].innerText = this.orders[i].name;
            orderDiv.children[1].innerText = `${this.orders[i].ingredients.length} ingredients`;
            orderDiv.children[2].innerText = this.orders[i].date.toLocaleDateString("en-US");
            orderDiv.children[3].innerText = `$${this.orders[i].getTotalCost().toFixed(2)}`;
            orderDiv.onclick = ()=>{controller.openSidebar("orderDetails", this.orders[i])};
            orderList.appendChild(orderDiv);
        }
    },

    getOrders: function(Order){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        return fetch("/order", {
            method: "get",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        })
        .then(response => response.json())
        .then((response)=>{
            if(typeof(response) === "string"){
                banner.createError(response);
            }else{
                let orders = [];
                let ingredients = [];
                for(let i = 0; i < response.length; i++){
                    for(let j = 0; j < response[i].ingredients.length; j++){
                        for(let k = 0; k < merchant.ingredients.length; k++){
                            if(merchant.ingredients[k].ingredient.id === response[i].ingredients[j].ingredient){
                                ingredients.push({
                                    ingredient: merchant.ingredients[k].ingredient,
                                    quantity: response[i].ingredients[j].quantity,
                                    pricePerUnit: response[i].ingredients[j].pricePerUnit
                                });
                                break;
                            }
                        }
                    }

                    orders.push(new Order(
                        response[i]._id,
                        response[i].name,
                        response[i].date,
                        response[i].taxes,
                        response[i].fees,
                        ingredients,
                        merchant
                    ));
                }

                return orders;
            }
        })
        .catch((err)=>{
            banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
        })
        .finally(()=>{
            loader.style.display = "none";
        });
    }
}

module.exports = orders;