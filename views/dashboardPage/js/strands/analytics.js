const Transaction = require("../classes/Transaction.js");

let analytics = {
    isPopulated: false,
    ingredient: undefined,
    category: undefined,
    recipe: undefined,
    recipeCategory: undefined,
    transactionsByDate: [],

    display: function(){
        if(!this.isPopulated){
            let analIngredientList = document.getElementById("analIngredientList");
            let analCategoriesList = document.getElementById("analCategoriesList");
            let analRecipeList = document.getElementById("analRecipeList");
            let analCatRecipeList = document.getElementById("analCatRecipeList");
            analIngredientList.onkeyup = ()=>{this.searchItems(analIngredientList.children)};
            analCategoriesList.onkeyup = ()=>{this.searchItems(analCategoriesList.children)};
            analRecipeList.onkeyup = ()=>{this.searchItems(analRecipeList.children)};
            analCatRecipeList.onkeyup = ()=>{this.searchItems(analCatRecipeList.children)};

            let ingredientTab = document.getElementById("analIngredientsTab");
            let recipeTab = document.getElementById("analRecipesTab");
            let categoryTab = document.getElementById("analCategoriesTab");
            let individualTab = document.getElementById("analIndividualTab");
            ingredientTab.onclick = ()=>{this.tab(ingredientTab)};
            categoryTab.onclick = ()=>{this.tab(categoryTab)};
            recipeTab.onclick = ()=>{this.tab(recipeTab)};
            individualTab.onclick = ()=>{this.tab(individualTab)};

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
        let recipeCategoryButtons = document.getElementById("analCatRecipeList");

        while(ingredientButtons.children.length > 1){
            ingredientButtons.removeChild(ingredientButtons.lastChild);
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

        while(categoryButtons.children.length > 1){
            categoryButtons.removeChild(categoryButtons.lastChild);
        }

        let categories = merchant.categorizeIngredients();
        for(let i = 0; i < categories.length; i++){
            let button = document.createElement("button");
            button.innerText = categories[i].name;
            button.classList.add("choosable");
            button.onclick = ()=>{
                this.category = categories[i];
                this.displayIngredientCategory();
            }
            categoryButtons.appendChild(button);
        }

        while(recipeButtons.children.length > 1){
            recipeButtons.removeChild(recipeButtons.lastChild);
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

        while(recipeCategoryButtons.children.length > 1){
            recipeCategoryButtons.removeChild(recipeCategoryButtons.lastChild);
        }

        let recipeCategories = merchant.categorizeRecipes();
        for(let i = 0; i < recipeCategories.length; i++){
            let button = document.createElement("button");
            button.innerText = (recipeCategories[i].name === "") ? "UNCATEGORIZED" : recipeCategories[i].name;
            
            button.classList.add("choosable");
            button.onclick = ()=>{
                this.recipeCategory = recipeCategories[i];
                this.displayRecipeCategory();
            }
            recipeCategoryButtons.appendChild(button);
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
        if(this.ingredient === undefined || this.transactionsByDate.length === 0) return;

        //break down data into dates and quantities
        let dates = [];
        let quantities = [];

        for(let i = 0; i < this.transactionsByDate.length; i++){
            dates.push(this.transactionsByDate[i].date);

            let sum = 0;
            for(let j = 0; j < this.transactionsByDate[i].transactions.length; j++){
                let transaction = this.transactionsByDate[i].transactions[j];
                sum += transaction.getIngredientQuantity(this.ingredient, true);
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

        let unit = (this.ingredient.unit === "bottle") ? this.ingredient.altUnit : this.ingredient.unit;

        let yaxis = `QUANTITY (${unit.toUpperCase()})`;

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

        document.getElementById("analMinUse").innerText = `${min.toFixed(2)} ${unit.toUpperCase()}`;
        document.getElementById("analAvgUse").innerText = `${(sum / quantities.length).toFixed(2)} ${unit.toUpperCase()}`;
        document.getElementById("analMaxUse").innerText = `${max.toFixed(2)} ${unit.toUpperCase()}`;

        //Create weekday averages
        let dayUse = [0, 0, 0, 0, 0, 0, 0];
        let dayCount = [0, 0, 0, 0, 0, 0, 0];
        for(let i = 0; i < quantities.length; i++){
            dayUse[dates[i].getDay()] += quantities[i];
            dayCount[dates[i].getDay()]++;
        }

        document.getElementById("analDayOne").innerText = `${(dayUse[0] / dayCount[0]).toFixed(2)} ${unit.toUpperCase()}`;
        document.getElementById("analDayTwo").innerText = `${(dayUse[1] / dayCount[1]).toFixed(2)} ${unit.toUpperCase()}`;
        document.getElementById("analDayThree").innerText = `${(dayUse[2] / dayCount[2]).toFixed(2)} ${unit.toUpperCase()}`;
        document.getElementById("analDayFour").innerText = `${(dayUse[3] / dayCount[3]).toFixed(2)} ${unit.toUpperCase()}`;
        document.getElementById("analDayFive").innerText = `${(dayUse[4] / dayCount[4]).toFixed(2)} ${unit.toUpperCase()}`;
        document.getElementById("analDaySix").innerText = `${(dayUse[5] / dayCount[5]).toFixed(2)} ${unit.toUpperCase()}`;
        document.getElementById("analDaySeven").innerText = `${(dayUse[6] / dayCount[6]).toFixed(2)} ${unit.toUpperCase()}`;
    },

    displayIngredientCategory: function(){
        if(this.category === undefined) this.category = merchant.categorizeIngredients()[0];
        if(this.category === undefined) return;

        let dates = [];
        let quantities = [];

        for(let i = 0; i < this.transactionsByDate.length; i++){
            dates.push(this.transactionsByDate[i].date);
            let total = 0;
            for(let j = 0; j < this.transactionsByDate[i].transactions.length; j++){
                let transaction = this.transactionsByDate[i].transactions[j];

                for(let k = 0; k < this.category.ingredients.length; k++){
                    let ingredient = this.category.ingredients[k].ingredient;
                    total += transaction.getIngredientQuantity(ingredient, true) * ingredient.getUnitCost();
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

    displayRecipeCategory: function(){
        if(this.recipeCategory === undefined) this.recipeCategory = merchant.categorizeRecipes()[0];

        let dates = [];
        let quantities = [];

        for(let i = 0; i < this.transactionsByDate.length; i++){
            dates.push(this.transactionsByDate[i].date);
            let total = 0;
            for(let j = 0; j < this.transactionsByDate[i].transactions.length; j++){
                for(let k = 0; k < this.recipeCategory.recipes.length; k++){
                    total += this.transactionsByDate[i].transactions[j].getRecipeQuantity(this.recipeCategory.recipes[k]);
                    total *= this.recipeCategory.recipes[k].price;
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
            title: (this.recipeCategory.name === "") ? "UNCATEGORIZED" : this.recipeCategory.name,
            xaxis: {title: "DATE"},
            yaxis: {title: "REVENUE ($)"},
            margin: {
                l: 40,
                r: 10,
                b: 20,
                t: 30
            },
            paper_bgcolor: "white"
        };

        Plotly.newPlot("analCatRecipeGraph", [trace], layout);
    },

    newDates: async function(){
        const from = document.getElementById("analStartDate").valueAsDate;
        const to = document.getElementById("analEndDate").valueAsDate;
        from.setHours(0, 0, 0, 0);
        to.setDate(to.getDate() + 1);
        to.setHours(0, 0, 0, 0);

        await this.getData(from, to);

        let analTabs = document.getElementById("analTabs");
        if(analTabs.children[0].children[0].classList.contains("active")){
            if(analTabs.children[1].children[0].classList.contains("active")){
                this.displayIngredient();
            }else{this.displayIngredientCategory()};
        }else{
            if(analTabs.children[1].children[0].classList.contains("active")){
                this.displayRecipe();
            }else{this.displayRecipeCategory()};
        }
    },

    tab: function(tab){
        let upperGroup = document.getElementById("topAnalTabs");
        let lowerGroup = document.getElementById("bottomAnalTabs");
        let strand = document.getElementById("analyticsStrand");

        for(let i = 0; i < tab.parentElement.children.length; i++){
            tab.parentElement.children[i].classList.remove("active");
        }

        tab.classList.add("active");

        for(let i = 1; i < strand.children.length; i++){
            strand.children[i].style.display = "none";
        }

        if(upperGroup.children[0].classList.contains("active")){
            if(lowerGroup.children[0].classList.contains("active")){
                document.getElementById("analIndividualIngredient").style.display = "flex";
                this.displayIngredient();
            }else{
                document.getElementById("analCategoryIngredient").style.display = "flex";
                this.displayIngredientCategory();
            }
        }else{
            if(lowerGroup.children[0].classList.contains("active")){
                document.getElementById("analIndividualRecipe").style.display = "flex";
                this.displayRecipe();
            }else{
                document.getElementById("analCategoryRecipe").style.display = "flex";
                this.displayRecipeCategory();
            }
        }
    },

    searchItems: function(list){
        let searchString = list[0].value;
        if(searchString === ""){
            for(let i = 1; i < list.length; i++){
                list[i].style.display = "block";
            }
        }else{
            for(let i = 1; i < list.length; i++){
                if(!list[i].innerText.toLowerCase().includes(searchString)){
                    list[i].style.display = "none";
                }else{
                    list[i].style.display = "flex";
                }
            }
        }
    }
}

module.exports = analytics;