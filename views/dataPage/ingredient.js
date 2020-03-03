window.ingredientObj = {
    display: function(type, ingredient){
        clearScreen();
        document.querySelector("#ingredientStrand").style.display = "flex";
        document.querySelector("strand-selector").setAttribute("strand", "ingredient");

        if(ingredient){
            document.querySelector("#ingredientStrand h1").innerText = ingredient.name;
            let startDate = new Date();
            startDate.setFullYear(new Date().getFullYear() - 1);

            let ingredientGraph = new LineGraph(
                document.querySelector("#ingredientStrand canvas"),
                this.formatData(type, ingredient.id),
                "Quantity",
                "Date",
                {
                    type: "date",
                    start: startDate,
                    end: new Date()
                }
            );
        }
    },

    formatData: function(type, id){
        dataList = new Array(365).fill(0);
        let today = new Date();
        
        if(type === "ingredient"){
            let dataLastDate = new Date(data.transactions[0].date);
            let dateRange = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(dataLastDate.getFullYear(), dataLastDate.getMonth(), dataLastDate.getDate())) / (1000 * 60 * 60 * 24));

            for(let transaction of data.transactions){
                let transDate = new Date(transaction.date);
                let diff = Math.floor((Date.UTC(transDate.getFullYear(), transDate.getMonth(), transDate.getDate()) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / (1000 * 60 * 60 * 24));
                if(diff <= 0){
                    for(let recipe of transaction.recipes){
                        for(let merchRecipe of data.merchant.recipes){
                            if(merchRecipe._id === recipe.recipe){
                                for(let ingredient of merchRecipe.ingredients){
                                    if(ingredient.ingredient === id){
                                        dataList[dateRange - Math.abs(diff)] += ingredient.quantity;
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
            }

            return dataList;
        }
    }
}