let orders = {
    orders: [],
    isPopulated: false,

    display: function(){
        if(this.isPopulated === false){
            document.getElementById("orderFilterBtn").onclick = ()=>{controller.openSidebar("orderFilter")};
            document.getElementById("newOrderBtn").onclick = ()=>{controller.openSidebar("newOrder")};

            this.displayOrders();
        }
    },

    displayOrders: function(){
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
            orderDiv.onclick = ()=>{
                controller.openSidebar("orderDetails", this.orders[i]);
                orderDiv.classList.add("active");
            }
            orderList.appendChild(orderDiv);
        }
    }
}

module.exports = orders;