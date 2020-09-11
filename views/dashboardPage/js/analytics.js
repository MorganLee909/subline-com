let analytics = {
    display: function(){
        const itemsList = document.getElementById("itemsList");

        let now = new Date();
        let lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate(), now.getHours(), now.getMinutes());

        document.getElementById("analStartDate").valueAsDate = lastMonth;
        document.getElementById("analEndDate").valueAsDate = now;
        document.getElementById("analDateBtn").onclick = ()=>{this.changeDates()};

        while(itemsList.children.length > 0){
            itemsList.removeChild(itemsList.firstChild);
        }

        for(let i = 0; i < merchant.ingredients.length; i++){
            let li = document.createElement("li");
            li.classList.add("itemButton");
            li.item = merchant.ingredients[i];
            li.innerText = merchant.ingredients[i].ingredient.name;
            li.onclick = ()=>{this.ingredientDisplay(merchant.ingredients[i], li)};
            itemsList.appendChild(li);
        }
    },

    ingredientDisplay: function(ingredient, li){
        const itemsList = document.getElementById("itemsList");
        for(let i = 0; i < itemsList.children.length; i++){
            itemsList.children[i].classList.remove("analItemActive");
        }
        li.classList.add("analItemActive");

        let startDate = new Date();
        startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes());

        //Get list of recipes that contain the ingredient
        let containingRecipes = [];

        for(let i = 0; i < merchant.recipes.length; i++){
            for(let j = 0; j < merchant.recipes[i].ingredients.length; j++){
                if(merchant.recipes[i].ingredients[j].ingredient === ingredient.ingredient){
                    containingRecipes.push({
                        recipe: merchant.recipes[i],
                        quantity: merchant.recipes[i].ingredients[j].quantity
                    });

                    break;
                }
            }
        }

        //Create Graph
        const dateIndices = merchant.transactionIndices(startDate);
        let quantities = [];
        let dates = [];
        let currentDate = merchant.transactions[dateIndices[0]].date;
        let currentQuantity = 0;

        for(let i = dateIndices[0]; i < dateIndices[1]; i++){
            if(currentDate.getDate() !== merchant.transactions[i].date.getDate()){
                quantities.push(ingredient.ingredient.convert(currentQuantity));
                dates.push(currentDate);
                currentQuantity = 0;
                currentDate = merchant.transactions[i].date;
            }

            for(let j = 0; j < merchant.transactions[i].recipes.length; j++){
                for(let k = 0; k < containingRecipes.length; k++){
                    if(merchant.transactions[i].recipes[j].recipe === containingRecipes[k].recipe){
                        for(let l = 0; l < merchant.transactions[i].recipes[j].recipe.ingredients.length; l++){
                            const transIngredient = merchant.transactions[i].recipes[j].recipe.ingredients[l];

                            if(transIngredient.ingredient === ingredient.ingredient){
                                currentQuantity += transIngredient.quantity * merchant.transactions[i].recipes[j].quantity;

                                break;
                            }
                        }
                    }
                }
            }
        }

        let trace = {
            x: dates,
            y: quantities,
            mode: "lines+markers"
        }

        const layout = {
            title: ingredient.ingredient.name
        }

        Plotly.newPlot("itemUseGraph", [trace], layout);

        //Create daily use card
        let sum = 0;
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
        }
        document.getElementById("analAvgUse").innerText = `${(sum / 30).toFixed(2)} ${ingredient.ingredient.unit}`;        
    },

    changeDates: function(){
        let dates = {
            from: document.getElementById("analStartDate").valueAsDate,
            to: document.getElementById("analEndDate").valueAsDate
        }

        if(dates.from > dates.to || dates.from === "" || dates.to === "" || dates.to > new Date()){
            banner.createError("INVALID DATE");
            return;
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/transaction/retrieve", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(dates)
        })
            .then((response)=>response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response.data);
                }else{
                    console.log(response);
                }
            })
            .catch((err)=>{
                banner.createError("ERROR: UNABLE TO DISPLAY THE DATA");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = analytics;