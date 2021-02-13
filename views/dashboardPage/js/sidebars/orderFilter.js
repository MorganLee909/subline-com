const Order = require("../classes/Order.js");

let orderFilter = {
    display: function(){
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

        document.getElementById("orderFilterSubmit").onclick = ()=>{this.submit()};
    },

    toggleActive: function(element){
        if(element.classList.contains("active")){
            element.classList.remove("active");
        }else{
            element.classList.add("active");
        }
    },

    submit: function(){
        let data = {
            from: document.getElementById("orderFilterDateFrom").valueAsDate,
            to: document.getElementById("orderFilterDateTo").valueAsDate,
            ingredients: []
        }

        data.from.setHours(0, 0, 0, 0);
        data.to.setHours(0, 0, 0, 0);

        let ingredients = document.getElementById("orderFilterIngredients").children;
        for(let i = 0; i < ingredients.length; i++){
            if(ingredients[i].classList.contains("active")){
                data.ingredients.push(ingredients[i].ingredient);
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/orders/get", {
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