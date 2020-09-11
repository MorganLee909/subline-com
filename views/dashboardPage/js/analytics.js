let analytics = {
    display: function(){
        const itemsList = document.getElementById("itemsList");

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
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - 30);

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
    }
}

module.exports = analytics;