let analytics = {
    newData: false,
    dateChange: false,
    transactions: [],
    ingredient: {},
    recipe: {},

    display: function(Transaction){
        document.getElementById("analDateBtn").onclick = ()=>{this.changeDates(Transaction)};

        if(this.transactions.length === 0 || this.newData === true){
            let startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            this.transactions = merchant.getTransactions(startDate);
        }

        let slider = document.getElementById("analSlider");
        slider.onchange = ()=>{this.display(Transaction)};

        let ingredientContent = document.getElementById("analIngredientContent");
        let recipeContent = document.getElementById("analRecipeContent");

        if(slider.checked){
            ingredientContent.style.display = "none";
            recipeContent.style.display = "flex";
            this.displayRecipes();
        }else{
            ingredientContent.style.display = "flex";
            recipeContent.style.display = "none"
            this.displayIngredients();
        }
    },

    displayIngredients: function(){
        const itemsList = document.getElementById("itemsList");

        while(itemsList.children.length > 0){
            itemsList.removeChild(itemsList.firstChild);
        }

        for(let i = 0; i < merchant.ingredients.length; i++){
            let li = document.createElement("li");
            li.classList.add("choosable");
            li.item = merchant.ingredients[i];
            li.innerText = merchant.ingredients[i].ingredient.name;
            li.onclick = ()=>{
                const itemsList = document.getElementById("itemsList");
                for(let i = 0; i < itemsList.children.length; i++){
                    itemsList.children[i].classList.remove("active");
                }

                li.classList.add("active");

                this.ingredient = merchant.ingredients[i];
                this.ingredientDisplay();
            };
            itemsList.appendChild(li);
        }

        if(this.dateChange && Object.keys(this.ingredient).length !== 0){
            this.ingredientDisplay();
        }
        this.dateChange = false;
    },

    displayRecipes: function(){
        let recipeList = document.getElementById("analRecipeList");
        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let li = document.createElement("li");
            li.classList.add("choosable");
            li.recipe = merchant.recipes[i];
            li.innerText = merchant.recipes[i].name;
            li.onclick = ()=>{
                let recipeList = document.getElementById("analRecipeList");
                for(let i = 0; i < recipeList.children.length; i++){
                    recipeList.children[i].classList.remove("active");
                }
                li.classList.add("active");

                this.recipe = merchant.recipes[i];
                this.recipeDisplay();
            }

            recipeList.appendChild(li);
        }

        if(this.dateChange  && Object.keys(this.recipe).length !== 0){
            this.recipeDisplay();
        }
        this.dateChange = false;
    },

    ingredientDisplay: function(){
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
        let currentDate = (this.transactions.length > 0) ? this.transactions[0].date : undefined;
        let currentQuantity = 0;

        for(let i = 0; i < this.transactions.length; i++){
            if(currentDate.getDate() !== this.transactions[i].date.getDate()){
                quantities.push(currentQuantity);
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

            if(i === this.transactions.length - 1){
                quantities.push(currentQuantity);
                dates.push(currentDate);
            }
        }

        let trace = {
            x: dates,
            y: quantities,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107)"
            }
        }

        const layout = {
            title: this.ingredient.ingredient.name.toUpperCase(),
            xaxis: {
                title: "DATE"
            },
            yaxis: {
                title: `QUANTITY (${this.ingredient.ingredient.unit.toUpperCase()})`,
            }
        }

        Plotly.newPlot("itemUseGraph", [trace], layout);

        //Create use cards
        let sum = 0;
        let max = 0;
        let min = (quantities.length > 0) ? quantities[0] : 0;
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
            if(quantities[i] > max){
                max = quantities[i];
            }else if(quantities[i] < min){
                min = quantities[i];
            }
        }
        document.getElementById("analMinUse").innerText = `${min.toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analAvgUse").innerText = `${(sum / quantities.length).toFixed(2)} ${this.ingredient.ingredient.unit}`;        
        document.getElementById("analMaxUse").innerText = `${max.toFixed(2)} ${this.ingredient.ingredient.unit}`;

        let dayUse = [0, 0, 0, 0, 0, 0, 0];
        let dayCount = [0, 0, 0, 0, 0, 0, 0];
        for(let i = 0; i < quantities.length; i++){
            dayUse[dates[i].getDay()] += quantities[i];
            dayCount[dates[i].getDay()]++;
        }

        document.getElementById("analDayOne").innerText = `${(dayUse[0] / dayCount[0]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDayTwo").innerText = `${(dayUse[1] / dayCount[1]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDayThree").innerText = `${(dayUse[2] / dayCount[2]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDayFour").innerText = `${(dayUse[3] / dayCount[3]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDayFive").innerText = `${(dayUse[4] / dayCount[4]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDaySix").innerText = `${(dayUse[5] / dayCount[5]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDaySeven").innerText = `${(dayUse[6] / dayCount[6]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
    },

    recipeDisplay: function(){
        let quantities = [];
        let dates = [];
        let currentDate;
        let quantity = 0;
        if(this.transactions.length > 0){
            currentDate = this.transactions[0].date;
        }

        for(let i = 0; i < this.transactions.length; i++){
            if(currentDate.getDate() !== this.transactions[i].date.getDate()){
                quantities.push(quantity);
                quantity = 0;
                dates.push(currentDate);
                currentDate = this.transactions[i].date;
            }

            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                const recipe = this.transactions[i].recipes[j];

                if(recipe.recipe === this.recipe){
                    quantity += recipe.quantity;
                }
            }

            if(i === this.transactions.length - 1){
                quantities.push(quantity);
                dates.push(currentDate);
            }
        }

        const trace = {
            x: dates,
            y: quantities,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107"
            }
        }

        const layout = {
            title: this.recipe.name.toUpperCase(),
            xaxis: {
                title: "DATE"
            },
            yaxis: {
                title: "Quantity"
            }
        }

        Plotly.newPlot("recipeSalesGraph", [trace], layout);

        let sum = 0;
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
        }

        document.getElementById("recipeAvgUse").innerText = (sum / quantities.length).toFixed(2);
        document.getElementById("recipeAvgRevenue").innerText = `$${(((sum / quantities.length) * this.recipe.price) / 100).toFixed(2)}`;
    },

    changeDates: function(Transaction){
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
            .then(response => response.json())
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

                    let isRecipe = document.getElementById("analSlider").checked;
                    if(isRecipe && Object.keys(this.recipe).length !== 0){
                        this.recipeDisplay();
                    }else if(!isRecipe && Object.keys(this.ingredient).length !== 0){
                        this.ingredientDisplay();
                    }
                    
                    this.dateChange = true;
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