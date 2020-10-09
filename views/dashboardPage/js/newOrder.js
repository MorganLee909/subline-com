let newOrder = {
    display: function(Order){
        document.getElementById("sidebarDiv").classList.add("sidebarWide");
        document.getElementById("newOrderIngredientList").style.display = "flex";

        let selectedList = document.getElementById("selectedIngredientList");
        while(selectedList.children.length > 0){
            selectedList.removeChild(selectedList.firstChild);
        }

        let ingredientList = document.getElementById("newOrderIngredients");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        for(let i = 0; i < merchant.ingredients.length; i++){
            let ingredient = document.createElement("button");
            ingredient.classList = "newOrderIngredient";
            ingredient.innerText = merchant.ingredients[i].ingredient.name;
            ingredient.onclick = ()=>{this.addIngredient(merchant.ingredients[i], ingredient)};
            ingredientList.appendChild(ingredient);
        }

        document.getElementById("submitNewOrder").onclick = ()=>{this.submit(Order)};
    },

    addIngredient: function(ingredient, element){
        element.style.display = "none";

        let div = document.getElementById("selectedIngredient").content.children[0].cloneNode(true);
        div.ingredient = ingredient;
        div.children[0].children[1].onclick = ()=>{this.removeIngredient(div, element)};

        //Display units depending on the whether it is a special unit
        if(ingredient.ingredient.specialUnit === "bottle"){
            div.children[0].children[0].innerText = `${ingredient.ingredient.name} (BOTTLES)`;
        }else{
            div.children[0].children[0].innerText = `${ingredient.ingredient.name} (${ingredient.ingredient.unit.toUpperCase()})`;
        }

        document.getElementById("selectedIngredientList").appendChild(div);
    },

    removeIngredient: function(selectedElement, element){
        selectedElement.parentElement.removeChild(selectedElement);
        element.style.display = "block";
    },

    submit: function(Order){
        let date = document.getElementById("newOrderDate").value;
        let taxes = document.getElementById("orderTaxes").value * 100;
        let fees = document.getElementById("orderFees").value * 100;
        let ingredients = document.getElementById("selectedIngredientList").children;

        if(date === ""){
            banner.createError("DATE IS REQUIRED FOR ORDERS");
            return;
        }

        let data = {
            name: document.getElementById("newOrderName").value,
            date: date,
            taxes: taxes,
            fees: fees,
            ingredients: []
        }

        for(let i = 0; i < ingredients.length; i++){
            let quantity = ingredients[i].children[1].children[0].value;
            let price = ingredients[i].children[1].children[1].value;

            if(quantity === "" || price === ""){
                banner.createError("MUST PROVIDE QUANTITY AND PRICE PER UNIT FOR ALL INGREDIENTS");
                return;
            }

            if(quantity < 0 || price < 0){
                banner.createError("QUANTITY AND PRICE MUST BE NON-NEGATIVE NUMBERS");
            }

            if(ingredients[i].ingredient.ingredient.specialUnit === "bottle"){
                const ppu = controller.convertPrice("volume", ingredients[i].ingredient.ingredient.unit, (price * 100) / (ingredients[i].ingredient.convert(ingredients[i].ingredient.unitSize)));

                data.ingredients.push({
                    ingredient: ingredients[i].ingredient.ingredient.id,
                    quantity: quantity * ingredients[i].ingredient.ingredient.unitSize,
                    pricePerUnit: ppu,
                });
            }else{
                data.ingredients.push({
                    ingredient: ingredients[i].ingredient.ingredient.id,
                    quantity: ingredients[i].ingredient.convertToBase(quantity),
                    pricePerUnit: controller.convertPrice(ingredients[i].ingredient.ingredient.unitType, ingredients[i].ingredient.ingredient.unit, price * 100)
                });
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/order/create", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then((response)=>response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    let order = new Order(
                        response._id,
                        response.name,
                        response.date,
                        response.taxes,
                        response.fees,
                        response.ingredients,
                        merchant
                    );

                    merchant.addOrder(order, true);
                    
                    banner.createNotification("NEW ORDER CREATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG, PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = newOrder;