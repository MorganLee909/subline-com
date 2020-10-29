let orderFilter = {
    display: function(Order){
        let now = new Date();
        let past = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        let ingredientList = document.getElementById("orderFilterIngredients");

        document.getElementById("orderFilterDateFrom").valueAsDate = past;
        document.getElementById("orderFilterDateTo").valueAsDate = now;

        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        for(let i = 0; i < merchant.ingredients.length; i++){
            let element = document.createElement("div");
            element.classList.add("choosable");
            element.ingredient = merchant.ingredients[i].ingredient.id;
            element.onclick = ()=>{this.toggleActive(element)};
            ingredientList.appendChild(element);

            let text = document.createElement("p");
            text.innerText = merchant.ingredients[i].ingredient.name;
            element.appendChild(text);
        }

        document.getElementById("orderFilterSubmit").onclick = ()=>{this.submit(Order)};
    },

    toggleActive: function(element){
        if(element.classList.contains("active")){
            element.classList.remove("active");
        }else{
            element.classList.add("active");
        }
    },

    submit: function(Order){
        let data = {
            startDate: document.getElementById("orderFilterDateFrom").valueAsDate,
            endDate: document.getElementById("orderFilterDateTo").valueAsDate,
            ingredients: []
        }

        if(data.startDate >= data.endDate){
            banner.createError("START DATE CANNOT BE AFTER END DATE");
            return;
        }

        let ingredients = document.getElementById("orderFilterIngredients").children;
        for(let i = 0; i < ingredients.length; i++){
            if(ingredients[i].classList.contains("active")){
                data.ingredients.push(ingredients[i].ingredient);
            }
        }

        if(data.ingredients.length === 0){
            for(let i = 0; i < merchant.ingredients.length; i++){
                data.ingredients.push(merchant.ingredients[i].ingredient.id);
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/order", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then((response)=>{
            let orders = [];
            if(typeof(response) === "string"){
                banner.createError(response);
            }else if(response.length === 0){
                banner.createError("NO ORDERS MATCH YOUR SEARCH");
            }else{
                let ingredients = [];
                for(let i = 0; i < response.length; i++){
                    for(let j = 0; j < response[i].ingredients.length; j++){
                        for(let k = 0; k < merchant.ingredients.length; k++){
                            if(merchant.ingredients[k].ingredient.id === response[i].ingredients[j].ingredient){
                                ingredients.push({
                                    ingredient: merchant.ingredients[k].ingredient,
                                    quantity: response[i].ingredients[j].quantity,
                                    pricePerUnit: response[i].ingredients[j].pricePerUnit
                                });
                                break;
                            }
                        }
                    }

                    orders.push(new Order(
                        response[i]._id,
                        response[i].name,
                        response[i].date,
                        response[i].taxes,
                        response[i].fees,
                        ingredients,
                        merchant
                    ));
                }    
            }

            controller.openStrand("orders", orders);
        })
        .catch((err)=>{
            banner.createError("UNABLE TO DISPLAY THE ORDERS");
        })
        .finally(()=>{
            loader.style.display = "none";
        });
    }
}

module.exports = orderFilter;