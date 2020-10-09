let orderDetails = {
    display: function(order){
        document.getElementById("removeOrderBtn").onclick = ()=>{this.remove(order)};

        document.getElementById("orderDetailName").innerText = order.name;
        document.getElementById("orderDetailDate").innerText = order.date.toLocaleDateString("en-US");
        document.getElementById("orderDetailTax").innerText = `$${(order.taxes / 100).toFixed(2)}`;
        document.getElementById("orderDetailFee").innerText = `$${(order.fees / 100).toFixed(2)}`;

        let ingredientList = document.getElementById("orderIngredients");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.getElementById("orderIngredient").content.children[0];
        for(let i = 0; i < order.ingredients.length; i++){
            let ingredientDiv = template.cloneNode(true);
            const ingredient = order.ingredients[i].ingredient;
            
            ingredientDiv.children[0].innerText = order.ingredients[i].ingredient.name;
            ingredientDiv.children[2].innerText = `$${(order.ingredients[i].cost() / 100).toFixed(2)}`;
            
            const ingredientDisplay = ingredientDiv.children[1];
            if(ingredient.specialUnit === "bottle"){
                ingredientDisplay.innerText = `${order.ingredients[i].quantity.toFixed(2)} bottles x $${(order.ingredients.pricePerUnit / 100).toFixed(2)}`;
            }else{
                ingredientDisplay.innerText = `${order.ingredients[i].quantity.toFixed(2)} ${ingredient.unit.toUpperCase()} X $${(order.ingredients[i].pricePerUnit / 100).toFixed(2)}`;
            }

            ingredientList.appendChild(ingredientDiv);
        }

        document.getElementById("orderDetailTotal").innerText = `$${(order.getIngredientCost() / 100).toFixed(2)}`;
        document.querySelector("#orderTotalPrice p").innerText = `$${(order.getTotalCost() / 100).toFixed(2)}`;
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
                    banner.createError(response);
                }else{
                    merchant.removeOrder(order);

                    controller.openStrand("orders");
                    banner.createNotification("ORDER REMOVED");
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

module.exports = orderDetails;