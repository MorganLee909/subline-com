const Transaction = require("../classes/Transaction.js");

let analytics = {
    isPopulated: false,
    ingredient: undefined,
    category: undefined,
    recipe: undefined,
    transactionsByDate: [],

    display: function(){
        if(!this.isPopulated){
            let ingredientTab = document.getElementById("analIngredientsTab");
            let recipeTab = document.getElementById("analRecipesTab");
            let categoryTab = document.getElementById("analCategoriesTab");
            ingredientTab.onclick = ()=>{this.tab(ingredientTab)};
            categoryTab.onclick = ()=>{this.tab(categoryTab)};
            recipeTab.onclick = ()=>{this.tab(recipeTab)};

            let to = new Date();
            let from = new Date(to.getFullYear(), to.getMonth() - 1, to.getDate());

            document.getElementById("analStartDate").valueAsDate = from;
            document.getElementById("analEndDate").valueAsDate = to;
            document.getElementById("analDateBtn").onclick = ()=>{this.newDates()};

            this.populateButtons();

            if(merchant.inventory.length > 0) this.ingredient = merchant.inventory[0].ingredient;
            if(merchant.recipes.length > 0) this.recipe = merchant.recipes[0];
            
            this.newDates();
            this.isPopulated = true;
        }
    },

    populateButtons: function(){
        let ingredientButtons = document.getElementById("analIngredientList");
        let categoryButtons = document.getElementById("analCategoriesList");
        let recipeButtons = document.getElementById("analRecipeList");

        while(ingredientButtons.children.length > 0){
            ingredientButtons.removeChild(ingredientButtons.firstChild);
        }

        for(let i = 0; i < merchant.inventory.length; i++){
            let button = document.createElement("button");
            button.innerText = merchant.inventory[i].ingredient.name;
            button.classList.add("choosable");
            button.onclick = ()=>{
                this.ingredient = merchant.inventory[i].ingredient;
                this.displayIngredient();
            };
            ingredientButtons.appendChild(button);
        }

        while(categoryButtons.children.length > 0){
            categoryButtons.removeChild(categoryButtons.firstChild);
        }

        let categories = merchant.categorizeIngredients();
        for(let i = 0; i < categories.length; i++){
            let button = document.createElement("button");
            button.innerText = categories[i].name;
            button.classList.add("choosable");
            button.onclick = ()=>{
                this.category = categories[i];
                this.displayCategory();
            }
            categoryButtons.appendChild(button);
        }

        while(recipeButtons.children.length > 0){
            recipeButtons.removeChild(recipeButtons.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let button = document.createElement("button");
            button.innerText = merchant.recipes[i].name;
            button.classList.add("choosable");
            button.onclick = ()=>{
                this.recipe = merchant.recipes[i];
                this.displayRecipe();
            };
            recipeButtons.appendChild(button);
        }
    },

    getData: function(from, to){
        let data = {
            from: from,
            to: to,
            recipes: []
        }
        
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        return fetch("/transaction", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    this.transactionsByDate = [];
                    response.reverse();

                    let startOfDay = new Date(from.getTime());
                    startOfDay.setHours(0, 0, 0, 0);
                    let endOfDay = new Date(from.getTime());
                    endOfDay.setDate(endOfDay.getDate() + 1);
                    endOfDay.setHours(0, 0, 0, 0);
                    
                    let transactionIndex = 0;
                    while(startOfDay <= to){
                        let currentTransactions = [];

                        while(transactionIndex < response.length && new Date(response[transactionIndex].date) < endOfDay){
                            currentTransactions.push(new Transaction(
                                response[transactionIndex]._id,
                                response[transactionIndex].date,
                                response[transactionIndex].recipes,
                                merchant
                            ));

                            transactionIndex++;
                        }

                        let thing = {
                            date: new Date(startOfDay.getTime()),
                            transactions: currentTransactions
                        };
                        this.transactionsByDate.push(thing);

                        startOfDay.setDate(startOfDay.getDate() + 1);
                        endOfDay.setDate(endOfDay.getDate() + 1);
                    }
                }
            })
            .catch((err)=>{
                controller.createBanner("UNABLE TO UPDATE THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    displayIngredient: function(){
        if(this.ingredient === undefined  || this.transactionsByDate.length === 0) return;

        //break down data into dates and quantities
        let dates = [];
        let quantities = [];

        for(let i = 0; i < this.transactionsByDate.length; i++){
            dates.push(this.transactionsByDate[i].date);

            let sum = 0;
            for(let j = 0; j < this.transactionsByDate[i].transactions.length; j++){
                let transaction = this.transactionsByDate[i].transactions[j];
                sum += transaction.getIngredientQuantity(this.ingredient);
            }
            
            quantities.push(sum);
        }

        //create and display the graph
        let trace = {
            x: dates,
            y: quantities,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107)"
            }
        }

        let yaxis = `QUANTITY (${this.ingredient.unit.toUpperCase()})`;

        let layout = {
            title: this.ingredient.name.toUpperCase(),
            xaxis: {title: "DATE"},
            yaxis: {title: yaxis},
            margin: {
                l: 40,
                r: 10,
                b: 20,
                t: 30
            },
            paper_bgcolor: "rgba(0, 0, 0, 0)"
        }

        Plotly.newPlot("itemUseGraph", [trace], layout);

        //Create min/max/avg
        //Current ingredient is stored on the "analMinUse" element
        let min = quantities[0];
        let max = quantities[0];
        let sum = 0;
        for(let i = 0; i < quantities.length; i++){
            if(quantities[i] < min) min = quantities[i];
            if(quantities[i] > max) max = quantities[i];

            sum += quantities[i];
        }

        document.getElementById("analMinUse").innerText = `${min.toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
        document.getElementById("analAvgUse").innerText = `${(sum / quantities.length).toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
        document.getElementById("analMaxUse").innerText = `${max.toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;

        //Create weekday averages
        let dayUse = [0, 0, 0, 0, 0, 0, 0];
        let dayCount = [0, 0, 0, 0, 0, 0, 0];
        for(let i = 0; i < quantities.length; i++){
            dayUse[dates[i].getDay()] += quantities[i];
            dayCount[dates[i].getDay()]++;
        }

        document.getElementById("analDayOne").innerText = `${(dayUse[0] / dayCount[0]).toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
        document.getElementById("analDayTwo").innerText = `${(dayUse[1] / dayCount[1]).toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
        document.getElementById("analDayThree").innerText = `${(dayUse[2] / dayCount[2]).toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
        document.getElementById("analDayFour").innerText = `${(dayUse[3] / dayCount[3]).toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
        document.getElementById("analDayFive").innerText = `${(dayUse[4] / dayCount[4]).toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
        document.getElementById("analDaySix").innerText = `${(dayUse[5] / dayCount[5]).toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
        document.getElementById("analDaySeven").innerText = `${(dayUse[6] / dayCount[6]).toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
    },

    displayCategory: function(){
        if(this.category === undefined) this.category = merchant.categorizeIngredients()[0];

        // let startOfDay = new Date();
        // startOfDay.setHours(0, 0, 0, 0);
        // let endOfDay = new Date();
        // endOfDay.setDate(endOfDay.getDate() + 1);
        // endOfDay.setHours(0, 0, 0, 0);

        // let dates = [];
        // let quantities = [];

        // for(let i = 0; i < 30; i++){
        //     dates.push(new Date(startOfDay));
        //     let transactions = merchant.getTransactions(startOfDay, endOfDay);

        //     let quantity = 0;
        //     for(let j = 0; j < transactions.length; j++){
        //         for(let k = 0; k < this.category.ingredients.length; k++){
        //             quantity += transactions[j].getIngredientQuantity(this.category.ingredients[k].ingredient);
        //         }
        //     }

        //     startOfDay.setDate(startOfDay.getDate() - 1);
        //     endOfDay.setDate(endOfDay.getDate() - 1);
        //     quantities.push(quantity);
        // }

        let dates = [];
        let quantities = [];

        for(let i = 0; i < this.transactionsByDate.length; i++){
            dates.push(this.transactionsByDate[i].date);
            let total = 0;
            for(let j = 0; j < this.transactionsByDate[i].transactions.length; j++){
                let transaction = this.transactionsByDate[i].transactions[j];

                for(let k = 0; k < this.category.ingredients.length; k++){
                    total += transaction.getIngredientQuantity(this.category.ingredients[k].ingredient);
                }
            }
            quantities.push(total);
        }

        let trace = {
            x: dates,
            y: quantities,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107)"
            }
        };

        let layout = {
            title: this.category.name,
            xaxis: {title: "DATE"},
            yaxis: {title: "COST ($)"},
            margin: {
                l: 40,
                r: 10,
                b: 20,
                t: 30
            },
            paper_bgcolor: "white"
        }

        Plotly.newPlot("analCategoriesGraph", [trace], layout);
    },

    displayRecipe: function(){
        if(this.recipe === undefined || this.transactionsByDate.length === 0) return;

        //break down data into dates and quantities
        let dates = [];
        let quantities = [];

        for(let i = 0; i < this.transactionsByDate.length; i++){
            dates.push(this.transactionsByDate[i].date);
            let sum = 0;

            for(let j = 0; j < this.transactionsByDate[i].transactions.length; j++){
                const transaction = this.transactionsByDate[i].transactions[j];

                for(let k = 0; k < transaction.recipes.length; k++){
                    if(transaction.recipes[k].recipe === this.recipe){
                        sum += transaction.recipes[k].quantity;
                    }
                }
            }

            quantities.push(sum);
        }
        
        //create and display the graph
        const trace = {
            x: dates,
            y: quantities,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107)"
            }
        }

        const layout = {
            title: this.recipe.name.toUpperCase(),
            xaxis: {title: "DATE"},
            yaxis: {title: "QUANTITY"},
            margin: {
                l: 40,
                r: 10,
                b: 20,
                t: 30
            },
            paper_bgcolor: "rgba(0, 0, 0, 0)"
        }

        Plotly.newPlot("recipeSalesGraph", [trace], layout);

        //Display the boxes at the bottom
        //Current recipe is stored on the "recipeAvgUse" element
        let avg = 0;
        for(let i = 0; i < quantities.length; i++){
            avg += quantities[i];
        }
        avg = avg / quantities.length;

        document.getElementById("recipeAvgUse").innerText = avg.toFixed(2);
        document.getElementById("recipeAvgRevenue").innerText = `$${(avg * this.recipe.price).toFixed(2)}`;
    },

    newDates: async function(){
        const from = document.getElementById("analStartDate").valueAsDate;
        const to = document.getElementById("analEndDate").valueAsDate;
        from.setHours(0, 0, 0, 0);
        to.setDate(to.getDate() + 1);
        to.setHours(0, 0, 0, 0);

        await this.getData(from, to);

        let analTabs = document.getElementById("analTabs");
        for(let i = 0; i < analTabs.children.length; i++){
            if(analTabs.children[i].classList.contains("active")){
                switch(analTabs.children[i].innerText.toLowerCase()){
                    case "ingredients":
                        this.displayIngredient();
                        break;
                    case "categories":
                        this.displayCategory();
                        break;
                    case "recipes":
                        this.displayRecipe();
                        break;
                }
            }
        }
    },

    tab: function(tab){
        let analTabs = document.getElementById("analTabs");
        let ingredientContent = document.getElementById("analIngredientContent");
        let categoryContent = document.getElementById("analCategoryContent");
        let recipeContent = document.getElementById("analRecipeContent");

        for(let i = 0; i < analTabs.children.length; i++){
            analTabs.children[i].classList.remove("active");
        }

        tab.classList.add("active");

        ingredientContent.style.display = "none";
        categoryContent.style.display = "none";
        recipeContent.style.display = "none";

        switch(tab.innerText.toLowerCase()){
            case "ingredients":
                this.displayIngredient();
                ingredientContent.style.display = "flex";
                break;
            case "categories":
                this.displayCategory();
                categoryContent.style.display = "flex";
                break;
            case "recipes":
                recipeContent.style.display = "flex";
                this.displayRecipe();
                break;
        }
    }
}

module.exports = analytics;