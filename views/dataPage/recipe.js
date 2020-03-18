window.recipeObj = {
    isPopulated: false,
    graph: {},

    display: function(recipe){
        clearScreen();
        document.querySelector("#recipeStrand").style.display = "flex";
        document.querySelector("strand-selector").setAttribute("strand", "recipe");

        if(!this.isPopulated){
            let date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            document.querySelector("#recipeFrom").valueAsDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
            document.querySelector("#recipeTo").valueAsDate = new Date();

            let recipesDiv = document.querySelector("#recipeOptions");

            for(let recipe of data.merchant.recipes){
                let checkDiv = document.createElement("div");
                checkDiv.classList = "checkboxDiv";
                recipesDiv.appendChild(checkDiv);

                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = `${recipe.name}Checkbox`;
                checkbox._id = recipe._id;
                checkbox.name = recipe.name;
                checkbox.onchange = ()=>{
                    if(checkbox.checked){
                        let from = document.querySelector("#recipeFrom").valueAsDate;
                        let to = document.querySelector("#recipeTo").valueAsDate;

                        this.graph.addData(this.formatData(recipe._id, from, to), [from, to], recipe.name);
                    }else{
                        this.graph.removeData(recipe.name);
                    }
                };
                checkDiv.appendChild(checkbox);

                let label = document.createElement("label");
                label.innerText = recipe.name;
                label.setAttribute("for", `${recipe.name}Checkbox`);
                checkDiv.appendChild(label);
            }

            this.graph = new LineGraph(
                document.querySelector("#recipeStrand canvas"),
                "Quantity",
                "Date"
            );

            this.isPopulated = true;
        }

        if(recipe){
            this.graph.clearData();

            let from = document.querySelector("#recipeFrom").valueAsDate;
            let to = document.querySelector("#recipeTo").valueAsDate;

            this.graph.addData(this.formatData(recipe.id, from, to), [from, to], recipe.name);

            for(let label of document.querySelector("#recipeOptions").children){
                if(label.innerText === ingredient.name){
                    label.children[0].checked = true;
                }else{
                    label.children[0].checked = false;
                }
            }
        }
    },

    formatData: function(id, from, to){
        let dateRange = Math.floor((Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) - Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / (1000 * 60 * 60 * 24)) + 1;
        let dataList = new Array(Math.abs(dateRange)).fill(0);

        for(let transaction of data.transactions){
            let transDate = new Date(transaction.date);
            let diff = Math.floor((Date.UTC(transDate.getFullYear(), transDate.getMonth(), transDate.getDate()) - Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())) / (1000 * 60 * 60 * 24));

            if(transDate > from && diff <= 0){
                for(let recipe of transaction.recipes){
                    if(recipe.recipe === id){
                        dataList[dateRange - Math.abs(diff) - 1] += recipe.quantity;
                    }
                }
            }
        }

        return dataList;
    },

    newDates: function(){
        let from = document.querySelector("#recipeFrom").value;
        let to = document.querySelector("#recipeTo").value;

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

                let recipesDiv = document.querySelector("#recipeOptions");
                for(let div of recipesDiv.children){
                    let checkbox = div.children[0];
                    if(checkbox.checked){
                        this.graph.addData(this.formatData(checkbox._id, from, to), [from, to], checkbox.name);
                    }
                }
            })
        }
    }
}