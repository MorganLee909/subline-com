window.ingredientObj = {
    isPopulated: false,
    graph: {},

    display: function(ingredient){
        clearScreen();
        document.querySelector("#ingredientStrand").style.display = "flex";
        document.querySelector("strand-selector").setAttribute("strand", "ingredient");

        if(!this.isPopulated){
            let date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            document.querySelector("#ingredientFrom").valueAsDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
            document.querySelector("#ingredientTo").valueAsDate = new Date();

            let ingredientsDiv = document.querySelector("#ingredientOptions");

            for(let item of data.merchant.inventory){
                let checkDiv = document.createElement("div");
                checkDiv.classList = "checkboxDiv";
                ingredientsDiv.appendChild(checkDiv);

                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = `${item.ingredient.name}Checkbox`;
                checkbox._id = item.ingredient._id;
                checkbox.name = item.ingredient.name;
                checkbox.onchange = ()=>{
                    if(checkbox.checked){
                        let from = document.querySelector("#ingredientFrom").valueAsDate;
                        let to = document.querySelector("#ingredientTo").valueAsDate;

                        this.graph.addData(this.formatData(item.ingredient._id, from, to), [from, to], item.ingredient.name);
                    }else{
                        this.graph.removeData(item.ingredient.name);
                    }
                };
                checkDiv.appendChild(checkbox);

                let label = document.createElement("label");
                label.innerText = item.ingredient.name;
                label.setAttribute("for", `${item.ingredient.name}Checkbox`);
                checkDiv.appendChild(label);
            }

            this.graph = new LineGraph(
                document.querySelector("#ingredientStrand canvas"),
                "Quantity",
                "Date",
            );

            this.isPopulated = true;
        }

        if(ingredient){
            this.graph.clearData();

            let from = document.querySelector("#ingredientFrom").valueAsDate;
            let to = document.querySelector("#ingredientTo").valueAsDate;
            
            this.graph.addData(this.formatData(ingredient.id, from, to), [from, to], ingredient.name);

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
        let dateRange = Math.floor((Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) - Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) / (1000 * 60 * 60 * 24)) + 1;
        let dataList = new Array(Math.abs(dateRange)).fill(0);

        for(let transaction of data.transactions){
            let transDate = new Date(transaction.date);
            let diff = Math.floor((Date.UTC(transDate.getFullYear(), transDate.getMonth(), transDate.getDate()) - Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())) / (1000 * 60 * 60 * 24));

            if(transDate > from && diff <= 0){
                for(let recipe of transaction.recipes){
                    for(let merchRecipe of data.merchant.recipes){
                        if(merchRecipe._id === recipe.recipe){
                            for(let ingredient of merchRecipe.ingredients){
                                if(ingredient.ingredient === id){
                                    dataList[dateRange - Math.abs(diff) - 1] += ingredient.quantity * recipe.quantity;
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }

        return dataList;
    },

    newDates: function(){
        let from = document.querySelector("#ingredientFrom").value;
        let to  = document.querySelector("#ingredientTo").value;

        if(from === "" || to === ""){
            banner.createError("Invalid date");
            return;
        }else{
            from = new Date(from);
            to = new Date(to);

            from.setMinutes(from.getMinutes() + from.getTimezoneOffset());
            to.setMinutes(to.getMinutes() + to.getTimezoneOffset());
        }

        if(validator.transaction.date(from, to)){
            window.fetchData(from, to, ()=>{
                this.graph.clearData();

                let ingredientsDiv = document.querySelector("#ingredientOptions");
                for(let div of ingredientsDiv.children){
                    let checkbox = div.children[0];
                    if(checkbox.checked){
                        this.graph.addData(this.formatData(checkbox._id, from, to), [from, to], checkbox.name);
                    }
                }
            });
        }
    }
}