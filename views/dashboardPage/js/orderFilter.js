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
            startDate: document.getElementById("orderFilterDateFrom").valueAsDate,
            endDate: document.getElementById("orderFilterDateTo").valueAsDate,
            ingredients: []
        }

        if(data.startDate >= data.endDate){
            banner.createError("START DATE CACNNOT BE AFTER END DATE");
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
            if(typeof(response) === "string"){
                banner.createError(response);
            }else{
                let orderList = document.getElementById("orderList");
                let template = document.getElementById("order").content.children[0];

                while(orderList.children.length > 0){
                    orderList.removeChild(orderList.firstChild);
                }

                for(let i = 0; i < response.length; i++){
                    let orderDiv = template.cloneNode(true);
                    let order = new Order(
                        response[i]._id,
                        response[i].name,
                        response[i].date,
                        response[i].taxes,
                        response[i].fees,
                        response[i].ingredients,
                        merchant
                    );

                    let cost = 0;
                    for(let j = 0; j < order.ingredients.length; j++){
                        cost += order.ingredients[j].price * order.ingredients[j].quantity;
                    }

                    orderDiv.children[0].innerText = order.name;
                    orderDiv.children[1].innerText = `${order.ingredients.length} items`;
                    orderDiv.children[2].innerText = order.date.toLocaleDateString();
                    orderDiv.children[3].innerText = `$${cost.toFixed(2)}`;
                    orderDiv.onclick = ()=>{controller.openSidebar("orderDetails", order)};
                    orderList.appendChild(orderDiv);
                }
            }
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