window.ingredientObj = {
    isPopulated: false,
    graph: {},

    display: function(type, ingredient){
        clearScreen();
        document.querySelector("#ingredientStrand").style.display = "flex";
        document.querySelector("strand-selector").setAttribute("strand", "ingredient");

        //A grabastic bag of bullshit to get rid of
        let d = new Date();
        d.setDate(d.getDate() - 20);

        if(!this.isPopulated){
            let ingredientsDiv = document.querySelector("#ingredientOptions");

            for(let item of data.merchant.inventory){
                let checkDiv = document.createElement("div");
                checkDiv.classList = "checkboxDiv";
                ingredientsDiv.appendChild(checkDiv);

                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = `${item.ingredient.name}Checkbox`;
                checkbox.onchange = ()=>{
                    if(checkbox.checked){
                        this.graph.addData(this.formatData("ingredient", item.ingredient._id));
                    }else{
                        this.graph.removeData(item.ingredient._id);
                    }
                };
                checkDiv.appendChild(checkbox);

                let label = document.createElement("label");
                label.innerText = item.ingredient.name;
                label.setAttribute("for", `${item.ingredient.name}Checkbox`);
                checkDiv.appendChild(label);
            }

            let startDate = new Date();
            startDate.setFullYear(new Date().getFullYear() - 1);

            this.graph = new LineGraph(
                document.querySelector("#ingredientStrand canvas"),
                "Quantity",
                "Date",
                {
                    type: "date",
                    start: d,
                    end: new Date()
                }
            );

            this.isPopulated = true;
        }

        if(ingredient){
            this.graph.clear();
            
            this.graph.addData(this.formatData(ingredient.id, d, new Date()));

            for(let label of document.querySelector("#ingredientOptions").children){
                if(label.innerText === ingredient.name){
                    label.children[0].checked = true;
                }else{
                    label.children[0].checked = false;
                }
            }
        }
    },

    formatData: function(id, startDate, endDate){
        let dataList;
    
        let dateRange = Math.floor((Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) - Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) / (1000 * 60 * 60 * 24));
        dataList = new Array(Math.abs(dateRange)).fill(0);

        for(let transaction of data.transactions){
            let transDate = new Date(transaction.date);
            let diff = Math.floor((Date.UTC(transDate.getFullYear(), transDate.getMonth(), transDate.getDate()) - Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())) / (1000 * 60 * 60 * 24));

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