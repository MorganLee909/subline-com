let orderDetails = {
    display: function(order){
        document.getElementById("removeOrderBtn").onclick = ()=>{this.remove(order)};

        document.getElementById("orderDetailName").innerText = order.name;
        document.getElementById("orderDetailDate").innerText = order.date.toLocaleDateString("en-US");
        document.getElementById("orderDetailTax").innerText = `$${order.taxes.toFixed(2)}`;
        document.getElementById("orderDetailFee").innerText = `$${order.fees.toFixed(2)}`;

        let ingredientList = document.getElementById("orderIngredients");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.getElementById("orderIngredient").content.children[0];
        for(let i = 0; i < order.ingredients.length; i++){
            let ingredientDiv = template.cloneNode(true);
            const ingredient = order.ingredients[i].ingredient;
            
            ingredientDiv.children[0].innerText = order.ingredients[i].ingredient.name;
            ingredientDiv.children[2].innerText = `$${order.ingredients[i].cost().toFixed(2)}`;
            ingredientDiv.onclick = ()=>{
                controller.openStrand("ingredients");
                controller.openSidebar("ingredientDetails", merchant.getIngredient(order.ingredients[i].ingredient.id));
            }
            
            let ingredientDisplay = ingredientDiv.children[1];
            if(ingredient.specialUnit === "bottle"){
                console.log(order.ingredients[i].pricePerUnit);
                ingredientDisplay.innerText = `${order.ingredients[i].quantity.toFixed(2)} bottles x $${order.ingredients[i].pricePerUnit.toFixed(2)}`;
            }else{
                ingredientDisplay.innerText = `${order.ingredients[i].quantity.toFixed(2)} ${ingredient.unit.toUpperCase()} X $${order.ingredients[i].pricePerUnit.toFixed(2)}`;
            }

            ingredientList.appendChild(ingredientDiv);
        }

        document.getElementById("orderDetailTotal").innerText = `$${order.getIngredientCost().toFixed(2)}`;
        document.querySelector("#orderTotalPrice p").innerText = `$${order.getTotalCost().toFixed(2)}`;
    },

    remove: function(order){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/order/${order.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    merchant.removeOrder(order);

                    controller.openStrand("orders", merchant.orders);
                    controller.createBanner("ORDER REMOVED", "success");
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

module.exports = orderDetails;