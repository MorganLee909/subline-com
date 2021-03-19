let orders = {
    isPopulated: false,

    display: function(){
        document.getElementById("orderFilterBtn").addEventListener("click", ()=>{controller.openSidebar("orderFilter")});
        document.getElementById("newOrderBtn").addEventListener("click", ()=>{controller.openSidebar("newOrder")});

        if(this.isPopulated === false){
            this.getOrders()
                .then((response)=>{
                    if(typeof(response) === "string"){
                        controller.createBanner(response, "error");
                    }else{
                        this.displayOrders();
                    }
                })
                .catch((err)=>{
                    controller.createBanner("UNABLE TO DISPLAY ORDERS", "error");
                });
        }else{
            this.displayOrders();
        }

        this.isPopulated = true;
    },

    getOrders: function(){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        let to = new Date();
        let from = new Date(to.getFullYear(), to.getMonth(), to.getDate() - 30);
        from.setHours(0, 0, 0, 0);

        let body = {
            to: to.toUTCString(),
            from: from.toUTCString(),
            ingredients: []};

        return fetch("/orders/get", {
            method: "post",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    merchant.clearOrders();
                    merchant.addOrders(response);
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    displayOrders: function(){
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
    }
}

module.exports = orders;