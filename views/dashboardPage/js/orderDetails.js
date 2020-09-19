let orderDetails = {
    display: function(order){
        document.getElementById("removeOrderBtn").onclick = ()=>{this.remove(order)};

        document.getElementById("orderDetailName").innerText = order.name;
        document.getElementById("orderDetailDate").innerText = order.date.toLocaleDateString("en-US");
        document.getElementById("orderDetailTime").innerText = order.date.toLocaleTimeString("en-US");

        let ingredientList = document.getElementById("orderIngredients");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.getElementById("orderIngredient").content.children[0];
        let grandTotal = 0;
        for(let i = 0; i < order.ingredients.length; i++){
            let ingredientDiv = template.cloneNode(true);
            let price = order.ingredients[i].pricePerUnit * order.ingredients[i].quantity;
            grandTotal += price;

            console.log(order.ingredients[i])
            const ingredient = order.ingredients[i].ingredient;
            const convertedQuantity = ingredient.convert(order.ingredients[i].quantity);
            const convertedPrice = controller.reconvertPrice(order.ingredients[i].ingredient.unitType, order.ingredients[i].ingredient.unit, order.ingredients[i].pricePerUnit);
            
            ingredientDiv.children[0].innerText = order.ingredients[i].ingredient.name;
            ingredientDiv.children[1].innerText = `${convertedQuantity.toFixed(2)} ${ingredient.unit.toUpperCase()} x $${(convertedPrice / 100).toFixed(2)}`;
            ingredientDiv.children[2].innerText = `$${(price / 100).toFixed(2)}`;

            ingredientList.appendChild(ingredientDiv);
        }

        document.querySelector("#orderTotalPrice p").innerText = `$${(grandTotal / 100).toFixed(2)}`;
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
                    merchant.editOrders([order], true);
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