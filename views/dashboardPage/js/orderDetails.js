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

            const ingredient = order.ingredients[i].ingredient;
            
            
            ingredientDiv.children[0].innerText = order.ingredients[i].ingredient.name;
            ingredientDiv.children[2].innerText = `$${(price / 100).toFixed(2)}`;
            
            const ingredientDisplay = ingredientDiv.children[1];
            if(ingredient.specialUnit === "bottle"){
                const quantSold = order.ingredients[i].quantity / ingredient.unitSize;
                const ppu = (order.ingredients[i].pricePerUnit * order.ingredients[i].quantity) / quantSold;

                ingredientDisplay.innerText = `${quantSold.toFixed(0)} bottles x $${(ppu / 100).toFixed(2)}`;
            }else{
                const convertedQuantity = ingredient.convert(order.ingredients[i].quantity);
                const convertedPrice = controller.reconvertPrice(order.ingredients[i].ingredient.unitType, order.ingredients[i].ingredient.unit, order.ingredients[i].pricePerUnit);

                ingredientDisplay.innerText = `${convertedQuantity.toFixed(2)} ${ingredient.unit.toUpperCase()} x $${(convertedPrice / 100).toFixed(2)}`;
            }

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
                    for(let i = 0; i < order.ingredients.length; i++){
                        order.ingredients[i].quantity = -order.ingredients[i].quantity;
                    }

                    merchant.editOrders([order], true);
                    merchant.editIngredients(order.ingredients, false, true);
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