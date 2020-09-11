const Transaction = require("./Transaction");

let analytics = {
    transactions: {},
    ingredient: {},

    display: function(){
        let startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        const dateIndices = controller.transactionIndices(merchant.transactions, startDate);

        this.transactions = merchant.transactions.slice(dateIndices[0], dateIndices[1]);
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
            li.onclick = ()=>{
                const itemsList = document.getElementById("itemsList");
                for(let i = 0; i < itemsList.children.length; i++){
                    itemsList.children[i].classList.remove("analItemActive");
                }

                li.classList.add("analItemActive");

                this.ingredient = merchant.ingredients[i];
                this.ingredientDisplay();
            };
            itemsList.appendChild(li);
        }
    },

    ingredientDisplay: function(){
        console.log(this.ingredient);
        //Get list of recipes that contain the ingredient
        let containingRecipes = [];

        for(let i = 0; i < merchant.recipes.length; i++){
            for(let j = 0; j < merchant.recipes[i].ingredients.length; j++){
                if(merchant.recipes[i].ingredients[j].ingredient === this.ingredient.ingredient){
                    containingRecipes.push({
                        recipe: merchant.recipes[i],
                        quantity: merchant.recipes[i].ingredients[j].quantity
                    });

                    break;
                }
            }
        }

        //Create Graph
        let quantities = [];
        let dates = [];
        let currentDate = this.transactions[0].date;
        let currentQuantity = 0;

        for(let i = 0; i < this.transactions.length; i++){
            if(currentDate.getDate() !== this.transactions[i].date.getDate()){
                quantities.push(this.ingredient.ingredient.convert(currentQuantity));
                dates.push(currentDate);
                currentQuantity = 0;
                currentDate = this.transactions[i].date;
            }

            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                for(let k = 0; k < containingRecipes.length; k++){
                    if(this.transactions[i].recipes[j].recipe === containingRecipes[k].recipe){
                        for(let l = 0; l < this.transactions[i].recipes[j].recipe.ingredients.length; l++){
                            const transIngredient = this.transactions[i].recipes[j].recipe.ingredients[l];

                            if(transIngredient.ingredient === this.ingredient.ingredient){
                                currentQuantity += transIngredient.quantity * this.transactions[i].recipes[j].quantity;

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
            title: this.ingredient.ingredient.name
        }

        Plotly.newPlot("itemUseGraph", [trace], layout);

        //Create daily use card
        let sum = 0;
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
        }
        document.getElementById("analAvgUse").innerText = `${(sum / 30).toFixed(2)} ${this.ingredient.ingredient.unit}`;        
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
                    this.transactions = [];                    

                    for(let i = 0; i < response.length; i++){
                        this.transactions.push(new Transaction(
                            response[i]._id,
                            new Date(response[i].date),
                            response[i].recipes,
                            merchant
                        ));
                    }
                    
                    this.ingredientDisplay();
                }
            })
            .catch((err)=>{
                console.log(err);
                banner.createError("ERROR: UNABLE TO DISPLAY THE DATA");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = analytics;