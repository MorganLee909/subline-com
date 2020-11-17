let analytics = {
    isPopulated: false,
    recipesDisplay: false,
    transactionsByDate: [],

    display: async function(Transaction){
        if(!this.isPopulated){
            let to = new Date()
            let from = new Date(to.getFullYear(), to.getMonth() - 1, to.getDate());
            await this.getData(from, to, Transaction);

            let analSlider = document.getElementById("analSlider");
            analSlider.onclick = ()=>{this.switchDisplay()};
            analSlider.checked = false;
            document.getElementById("analRecipeContent").style.display = "none";


            this.populateButtons();
            this.displayIngredient(merchant.ingredients[0].ingredient);
            this.displayRecipe(merchant.recipes[0]);
            
            this.isPopulated = true;
        }
    },

    populateButtons: function(){
        let ingredientButtons = document.getElementById("analIngredientList");
        let recipeButtons = document.getElementById("analRecipeList");

        for(let i = 0; i < merchant.ingredients.length; i++){
            let button = document.createElement("button");
            button.innerText = merchant.ingredients[i].ingredient.name;
            button.classList.add("choosable");
            button.onclick = ()=>{this.displayIngredient(merchant.ingredients[i].ingredient)};
            ingredientButtons.appendChild(button);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let button = document.createElement("button");
            button.innerText = merchant.recipes[i].name;
            button.classList.add("choosable");
            button.onclick = ()=>{this.displayRecipe(merchant.recipes[i])};
            recipeButtons.appendChild(button);
        }
    },

    getData: function(from, to, Transaction){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        return fetch(`/transactions/${from.toISOString()}/${to.toISOString()}`)
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    this.transactionsByDate = [];

                    for(let i = 0; i < response.length; i++){
                        const date = new Date(response[i].date);
                        let newDate = {
                            date: date,
                            transactions: []
                        };

                        for(let j = 0; j < response[i].transactions.length; j++){
                            newDate.transactions.push(new Transaction(
                                response[i].transactions[j]._id,
                                date,
                                response[i].transactions[j].recipes,
                                merchant
                            ));
                        }

                        this.transactionsByDate.push(newDate);
                    }
                }
            })
            .catch((err)=>{
                banner.createError("UNABLE TO UPDATE THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    displayIngredient: function(ingredient){
        //break down data into dates and quantities
        let dates = [];
        let quantities = [];

        for(let i = 0; i < this.transactionsByDate.length; i++){
            dates.push(this.transactionsByDate[i].date);

            let sum = 0;
            for(let j = 0; j < this.transactionsByDate[i].transactions.length; j++){
                let transactions = this.transactionsByDate[i].transactions[j];
                sum += transactions.getIngredientQuantity(ingredient);
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

        const layout = {
            title: ingredient.name.toUpperCase(),
            xaxis: {title: "DATE"},
            yaxis: {title: `QUANTITY (${ingredient.unit.toUpperCase()})`}
        }

        Plotly.newPlot("itemUseGraph", [trace], layout);

        //Create min/max/avg 
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

        document.getElementById("analMinUse").innerText = `${min.toFixed(2)} ${ingredient.unit.toUpperCase()}`;
        document.getElementById("analAvgUse").innerText = `${(sum / quantities.length).toFixed(2)} ${ingredient.unit.toUpperCase()}`;
        document.getElementById("analMaxUse").innerText = `${max.toFixed(2)} ${ingredient.unit.toUpperCase()}`;

        //Create weekday averages
        let dayUse = [0, 0, 0, 0, 0, 0, 0];
        let dayCount = [0, 0, 0, 0, 0, 0, 0];
        for(let i = 0; i < quantities.length; i++){
            dayUse[dates[i].getDay()] += quantities[i];
            dayCount[dates[i].getDay()]++;
        }

        document.getElementById("analDayOne").innerText = `${(dayUse[0] / dayCount[0]).toFixed(2)} ${ingredient.unit.toUpperCase()}`;
        document.getElementById("analDayTwo").innerText = `${(dayUse[1] / dayCount[1]).toFixed(2)} ${ingredient.unit.toUpperCase()}`;
        document.getElementById("analDayThree").innerText = `${(dayUse[2] / dayCount[2]).toFixed(2)} ${ingredient.unit.toUpperCase()}`;
        document.getElementById("analDayFour").innerText = `${(dayUse[3] / dayCount[3]).toFixed(2)} ${ingredient.unit.toUpperCase()}`;
        document.getElementById("analDayFive").innerText = `${(dayUse[4] / dayCount[4]).toFixed(2)} ${ingredient.unit.toUpperCase()}`;
        document.getElementById("analDaySix").innerText = `${(dayUse[5] / dayCount[5]).toFixed(2)} ${ingredient.unit.toUpperCase()}`;
        document.getElementById("analDaySeven").innerText = `${(dayUse[6] / dayCount[6]).toFixed(2)} ${ingredient.unit.toUpperCase()}`;
    },

    displayRecipe: function(recipe){
        //break down data into dates and quantities
        let dates = [];
        let quantities = [];

        for(let i = 0; i < this.transactionsByDate.length; i++){
            dates.push(this.transactionsByDate[i].date);
            let sum = 0;

            for(let j = 0; j < this.transactionsByDate[i].transactions.length; j++){
                const transaction = this.transactionsByDate[i].transactions[j];

                for(let k = 0; k < transaction.recipes.length; k++){
                    if(transaction.recipes[k].recipe === recipe){
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
            title: recipe.name.toUpperCase(),
            xaxis: {title: "DATE"},
            yaxis: {title: "QUANTITY"}
        }

        Plotly.newPlot("recipeSalesGraph", [trace], layout);

        //Display the boxes at the bottom
        let avg = 0;
        for(let i = 0; i < quantities.length; i++){
            avg += quantities[i];
        }
        avg = avg / quantities.length;

        document.getElementById("recipeAvgUse").innerText = avg.toFixed(2);
        document.getElementById("recipeAvgRevenue").innerText = `$${(avg * recipe.price).toFixed(2)}`
    },

    switchDisplay: function(){
        const checkbox = document.getElementById("analSlider");
        let ingredient = document.getElementById("analIngredientContent");
        let recipe = document.getElementById("analRecipeContent");

        if(checkbox.checked === true){
            ingredient.style.display = "none";
            recipe.style.display = "flex";
            if(this.recipesDisplay === false){
                this.displayRecipe(merchant.recipes[0]);
            }
        }else{
            ingredient.style.display = "flex";
            recipe.style.display = "none";
        }
    }
}

module.exports = analytics;