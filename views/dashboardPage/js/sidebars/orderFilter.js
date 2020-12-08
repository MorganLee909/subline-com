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
            controller.createBanner("START DATE CANNOT BE AFTER END DATE", "error");
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
                controller.createBanner(response, "error");
            }else if(response.length === 0){
                controller.createBanner("NO ORDERS MATCH YOUR SEARCH", "error");
            }else{
                for(let i = 0; i < response.length; i++){
                    orders.push(new Order(
                        response[i]._id,
                        response[i].name,
                        response[i].date,
                        response[i].taxes,
                        response[i].fees,
                        response[i].ingredients,
                        merchant
                    ));
                }
            }

            controller.openStrand("orders", orders);
        })
        .catch((err)=>{
            controller.createBanner("UNABLE TO DISPLAY THE ORDERS", "error");
        })
        .finally(()=>{
            loader.style.display = "none";
        });
    }
}

module.exports = orderFilter;