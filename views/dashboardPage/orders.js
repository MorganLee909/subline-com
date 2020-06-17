window.ordersStrandObj = {
    isFetched: false,

    display: async function(){
        if(!this.isFetched){
            window.orders = [];

            fetch("/order", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
            })
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        let newOrders = [];
                        for(let i = 0; i < response.length; i++){
                            newOrders.push(new Order(
                                response[i].name,
                                new Date(response.date),
                                response[i].ingredients,
                                merchant
                            ));
                        }
                        merchant.editOrders(newOrders);

                        isFetched = true;
                    }
                })
                .catch((err)=>{
                    console.log(err);
                    banner.createError("Unable to retrieve your orders at the moment");
                });
        }
    },

    populate: function(){
        let listDiv = document.querySelector("#orderList");
        let template = document.querySelector("#order").content.children[0];

        while(listDiv.children.length > 0){
            listDiv.removeChild(listDiv.firstChild);
        }

        for(let i = 0; i < merchant.orders.length; i++){
            let row = template.cloneNode(true);
            let totalCost = 0;
            
            for(let j = 0; j < merchant.orders[i].ingredients.length; j++){
                
                totalCost += merchant.orders[i].ingredients[j].quantity * merchant.orders[i].ingredients[j].price;
            }

            row.children[0].innerText = merchant.orders[i].name;
            row.children[1].innerText = `${merchant.orders[i].ingredients.length} items`;
            row.children[2].innerText = new Date(merchant.orders[i].date).toLocaleDateString("en-US");
            row.children[3].innerText = (totalCost / 100).toFixed(2);
            row.order = merchant.orders[i];
            row.onclick = ()=>{orderDetailsComp.display(merchant.orders[i])};

            window.orders.push(row);
            listDiv.appendChild(row);
        }
    }
}