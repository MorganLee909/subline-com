let newOrder = {
    display: function(){
        document.getElementById("sidebarDiv").classList.add("sidebarWide");
        document.getElementById("newOrderIngredientList").style.display = "flex";

        let selectedList = document.getElementById("selectedIngredientList");
        while(selectedList.children.length > 0){
            selectedList.removeChild(selectedList.firstChild);
        }

        let ingredientList = document.getElementById("newOrderIngredients");
        ingredientList.children[0].onkeyup = ()=>{this.searchIngredients()};
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        merchant.inventory.sort((a, b) => (a.ingredient.name > b.ingredient.name) ? 1 : -1);
        for(let i = 0; i < merchant.inventory.length; i++){
            let ingredient = document.createElement("button");
            ingredient.classList = "choosable";
            ingredient.innerText = merchant.inventory[i].ingredient.name;
            ingredient.onclick = ()=>{this.addIngredient(merchant.inventory[i], ingredient)};
            ingredientList.appendChild(ingredient);
        }

        document.getElementById("submitNewOrder").onclick = ()=>{this.submit()};
    },

    addIngredient: function(ingredient, element){
        element.style.display = "none";

        let div = document.getElementById("selectedIngredient").content.children[0].cloneNode(true);
        div.ingredient = ingredient;
        div.children[0].children[1].onclick = ()=>{this.removeIngredient(div, element)};

        div.children[0].children[0].innerText = `${ingredient.ingredient.name} (${ingredient.ingredient.unit.toUpperCase()})`;

        document.getElementById("selectedIngredientList").appendChild(div);
    },

    removeIngredient: function(selectedElement, element){
        selectedElement.parentElement.removeChild(selectedElement);
        element.style.display = "block";
    },

    submit: function(){
        let date = document.getElementById("newOrderDate").valueAsDate;
        let taxes = document.getElementById("orderTaxes").value * 100;
        let fees = document.getElementById("orderFees").value * 100;
        let ingredients = document.getElementById("selectedIngredientList").children;
        
        if(date === null){
            controller.createBanner("DATE IS REQUIRED FOR ORDERS", "error");
            return;
        }
    
        date.setHours(0, 0, 0, 0);

        let data = {
            name: document.getElementById("newOrderName").value,
            date: date,
            taxes: taxes,
            fees: fees,
            ingredients: []
        };

        for(let i = 0; i < ingredients.length; i++){
            let quantity = ingredients[i].children[1].children[0].value;
            let price = ingredients[i].children[1].children[1].value;
            let unit = (ingredients[i].ingredient.ingredient.unit === "bottle") ? ingredients[i].ingredient.ingredient.altUnit : ingredients[i].ingredient.ingredient.unit;

            let newIngredient = {
                ingredient: ingredients[i].ingredient.ingredient.id,
                quantity: controller.toBase(quantity, unit),
                pricePerUnit: (price * 100) / controller.unitMultiplier(unit, controller.getBaseUnit(unit))
            };

            if(ingredients[i].ingredient.ingredient.unit === "bottle"){
                let toBottle = ingredients[i].ingredient.ingredient.convert.toBottle;
                newIngredient.quantity = quantity / toBottle;
                newIngredient.pricePerUnit = toBottle * (price * 100);
            }

            data.ingredients.push(newIngredient);
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
                    controller.createBanner(response, "error");
                }else{
                    let from = new Date();
                    from.setDate(from.getDate() - 30);
                    if(new Date(response.date) > from){
                        merchant.addOrders([response], true);
                        state.updateOrders();
                    }
                    
                    controller.openStrand("orders", merchant.orders);
                    controller.createBanner("NEW ORDER CREATED", "success");
                }
            })
            .catch((err)=>{
                console.error(err);
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    searchIngredients: function(){
        let items = document.getElementById("newOrderIngredients").children;
        let searchString = items[0].value.toLowerCase();

        if(searchString === ""){
            for(let i = 1; i < items.length; i++){
                items[i].style.display = "flex";
            }
        }else{
            for(let i = 1; i < items.length; i++){
                if(items[i].innerText.toLowerCase().includes(searchString)){
                    items[i].style.display = "flex";
                }else{
                    items[i].style.display = "none";
                }
            }
        }
    }
};

module.exports = newOrder;