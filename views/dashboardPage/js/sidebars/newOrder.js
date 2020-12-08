let newOrder = {
    display: function(Order){
        document.getElementById("sidebarDiv").classList.add("sidebarWide");
        document.getElementById("newOrderIngredientList").style.display = "flex";
        document.getElementById("orderFileUpload").addEventListener("click", ()=>{controller.openModal("orderSpreadsheet")});

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
            ingredient.classList = "choosable";
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

        //TODO: this should be handled by the class
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
            controller.createBanner("DATE IS REQUIRED FOR ORDERS", "error");
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
                controller.createBanner("MUST PROVIDE QUANTITY AND PRICE PER UNIT FOR ALL INGREDIENTS", "error");
                return;
            }

            if(quantity < 0 || price < 0){
                controller.createBanner("QUANTITY AND PRICE MUST BE NON-NEGATIVE NUMBERS", "error");
            }

            if(ingredients[i].ingredient.ingredient.specialUnit === "bottle"){
                data.ingredients.push({
                    ingredient: ingredients[i].ingredient.ingredient.id,
                    quantity: quantity * ingredients[i].ingredient.ingredient.unitSize,
                    pricePerUnit: this.convertPrice(ingredients[i].ingredient.ingredient, price * 100)
                });
            }else{
                data.ingredients.push({
                    ingredient: ingredients[i].ingredient.ingredient.id,
                    quantity: ingredients[i].ingredient.convertToBase(quantity),
                    pricePerUnit: this.convertPrice(ingredients[i].ingredient.ingredient, price * 100)
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
                    controller.createBanner(response, "error");
                }else{
                    merchant.addOrder(response, true);
                    
                    controller.openStrand("orders", merchant.orders);
                    controller.createBanner("NEW ORDER CREATED", "success");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG, PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    //TODO: Remove this function, it should be on the order
    convertPrice: function(ingredient, price){
        if(ingredient.specialUnit === "bottle"){
            return price / ingredient.unitSize;
        }

        switch(ingredient.unit){
            case "g": return price;
            case "kg": return price / 1000; 
            case "oz": return price / 28.3495; 
            case "lb": return price / 453.5924; 
            case "ml": return price * 1000; 
            case "l": return price;
            case "tsp": return price * 202.8842; 
            case "tbsp": return price * 67.6278; 
            case "ozfl": return price * 33.8141; 
            case "cup": return price * 4.1667; 
            case "pt": return price * 2.1134; 
            case "qt": return price * 1.0567; 
            case "gal": return price / 3.7854; 
            case "mm": return price * 1000; 
            case "cm": return price * 100; 
            case "m": return price;
            case "in": return price * 39.3701; 
            case "ft": return price * 3.2808; 
        }
    },

    submitSpreadsheet: function(){
        event.preventDefault();
        controller.closeModal();

        const file = document.getElementById("spreadsheetInput").files[0];
        let data = new FormData();
        data.append("orders", file);

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/orders/create/spreadsheet", {
            method: "post",
            body: data
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    for(let i = 0; i < response.length; i++){
                        merchant.addOrder(response[i], true);
                    }

                    controller.createBanner("ORDER CREATED AND INGREDIENTS UPDATED SUCCESSFULLY", "success");
                    controller.openStrand("orders");
                }
            })
            .catch((err)=>{
                controller.createBanner("UNABLE TO DISPLAY NEW ORDER. PLEASE REFRESH THE PAGE.", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = newOrder;