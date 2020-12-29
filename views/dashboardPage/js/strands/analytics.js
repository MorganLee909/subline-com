let analytics = {
    isPopulated: false,
    ingredient: undefined,
    recipe: undefined,
    transactionsByDate: [],

    display: function(Transaction){
        if(!this.isPopulated){
            document.getElementById("analRecipeContent").style.display = "none";

            let to = new Date()
            let from = new Date(to.getFullYear(), to.getMonth() - 1, to.getDate());

            document.getElementById("analStartDate").valueAsDate = from;
            document.getElementById("analEndDate").valueAsDate = to;
            let analSlider = document.getElementById("analSlider");
            analSlider.onclick = ()=>{this.switchDisplay()};
            analSlider.checked = false;
            document.getElementById("analDateBtn").onclick = ()=>{this.newDates(Transaction)};

            this.populateButtons();

            if(merchant.ingredients.length > 0){
                this.ingredient = merchant.ingredients[0].ingredient;
            }
            if(merchant.recipes.length > 0){
                this.recipe = merchant.recipes[0];
            }
            
            this.newDates(Transaction);
            
            this.isPopulated = true;
        }
    },

    populateButtons: function(){
        let ingredientButtons = document.getElementById("analIngredientList");
        let recipeButtons = document.getElementById("analRecipeList");

        while(ingredientButtons.children.length > 0){
            ingredientButtons.removeChild(ingredientButtons.firstChild);
        }

        for(let i = 0; i < merchant.ingredients.length; i++){
            let button = document.createElement("button");
            button.innerText = merchant.ingredients[i].ingredient.name;
            button.classList.add("choosable");
            button.onclick = ()=>{
                this.ingredient = merchant.ingredients[i].ingredient;
                this.displayIngredient();
            };
            ingredientButtons.appendChild(button);
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

    getData: function(from, to, Transaction){
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
                "Content-Type": "application/json;charset=utf-8"
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
        if(this.ingredient === undefined  || this.transactionsByDate.length === 0){
            return;
        }

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

        const layout = {
            title: this.ingredient.name.toUpperCase(),
            xaxis: {title: "DATE"},
            yaxis: {title: yaxis}
        }

        Plotly.newPlot("itemUseGraph", [trace], layout);

        //Create min/max/avg
        //Current ingredient is stored on the "analMinUse" element
        let min = quantities[0];
        let max = quantities[0];
        let sum = 0;
        for(let i = 0; i < quantities.length; i++){
            if(quantities[i] < min){
                min = quantities[i];
            }
            if(quantities[i] > max){
                max = quantities[i];
            }

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

    displayRecipe: function(){
        if(this.recipe === undefined || this.transactionsByDate.length === 0){
            return;
        }

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
            yaxis: {title: "QUANTITY"}
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

    switchDisplay: function(){
        const checkbox = document.getElementById("analSlider");
        let ingredient = document.getElementById("analIngredientContent");
        let recipe = document.getElementById("analRecipeContent");

        if(checkbox.checked === true){
            ingredient.style.display = "none";
            recipe.style.display = "flex";
            this.displayRecipe();
        }else{
            ingredient.style.display = "flex";
            recipe.style.display = "none";
            this.displayIngredient();
        }
    },

    newDates: async function(Transaction){
        const from = document.getElementById("analStartDate").valueAsDate;
        const to = document.getElementById("analEndDate").valueAsDate;
        from.setHours(0, 0, 0, 0);
        to.setDate(to.getDate() + 1);
        to.setHours(0, 0, 0, 0);

        await this.getData(from, to, Transaction);

        if(document.getElementById("analSlider").checked === true){
            this.displayRecipe();
        }else{
            this.displayIngredient();
        }
    }
}

module.exports = analytics;