let orders = {
    display: function(){
        document.getElementById("orderFilterBtn").addEventListener("click", ()=>{controller.openSidebar("orderFilter")});
        document.getElementById("newOrderBtn").addEventListener("click", ()=>{controller.openSidebar("newOrder")});
        document.getElementById("orderCalcBtn").addEventListener("click", ()=>{controller.openSidebar("orderCalculator")});

        let orderList = document.getElementById("orderList");
        let template = document.getElementById("order").content.children[0];

        while(orderList.children.length > 0){
            orderList.removeChild(orderList.firstChild);
        }

        for(let i = 0; i < merchant.orders.length; i++){
            let orderDiv = template.cloneNode(true);
            orderDiv.order = merchant.orders[i];
            orderDiv.children[0].innerText = merchant.orders[i].name;
            orderDiv.children[1].innerText = `${merchant.orders[i].ingredients.length} ingredients`;
            orderDiv.children[2].innerText = merchant.orders[i].date.toLocaleDateString("en-US");
            orderDiv.children[3].innerText = `$${merchant.orders[i].getTotalCost().toFixed(2)}`;
            orderDiv.onclick = ()=>{
                controller.openSidebar("orderDetails", merchant.orders[i]);
                orderDiv.classList.add("active");
            }
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
                controller.createBanner(response, "error");
            }else{
                let orders = [];

                for(let i = 0; i < response.length; i++){
                    orders.push(new Order(
                        response[i]._id,
                        response[i].name,
                        response[i].date,
                        response[i].taxes,
                        response[i].fees,
                        response[i].ingredients,
                        merchant
                    ));
                }

                if(merchant.orders.length === 0){
                    merchant.setOrders(orders);
                }

                return orders;
            }
        })
        .catch((err)=>{
            controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
        })
        .finally(()=>{
            loader.style.display = "none";
        });
    }
}

module.exports = orders;