window.ingredientObj = {
    isPopulated: false,
    graph: {},

    display: function(type, ingredient){
        clearScreen();
        document.querySelector("#ingredientStrand").style.display = "flex";
        document.querySelector("strand-selector").setAttribute("strand", "ingredient");

        if(!this.isPopulated){
            let ingredientsDiv = document.querySelector("#ingredientOptions");

            for(let item of data.merchant.inventory){
                let label = document.createElement("label");
                label.innerText = item.ingredient.name;
                ingredientsDiv.appendChild(label);
                
                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.onchange = ()=>{
                    if(checkbox.checked){
                        this.graph.addData(this.formatData("ingredient", item.ingredient._id));
                    }else{
                        this.graph.removeData(item.ingredient._id);
                    }
                };
                label.appendChild(checkbox);
            }

            let startDate = new Date();
            startDate.setFullYear(new Date().getFullYear() - 1);

            this.graph = new LineGraph(
                document.querySelector("#ingredientStrand canvas"),
                "Quantity",
                "Date",
                {
                    type: "date",
                    start: startDate,
                    end: new Date()
                }
            );

            this.isPopulated = true;
        }

        if(ingredient){
            this.graph.addData(this.formatData("ingredient", ingredient.id));
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

            return {id: id, set: dataList};
        }
    }
}