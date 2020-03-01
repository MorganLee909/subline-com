window.graphObj = {
    display: function(type, ingredient){
        clearScreen();
        document.querySelector("#graphAction").style.display = "flex";
        document.querySelector("#graphAction h1").innerText = `${ingredient.name} (${ingredient.unit})`;

        graph.line(document.querySelector("#graphAction canvas"), this.formatData(type, ingredient.id));
    },

    formatData: function(type, id){
        dataList = new Array(365).fill(0);
        let today = new Date();
        if(type === "ingredient"){
            for(let transaction of data.transactions){
                let transDate = new Date(transaction.date);
                let diff = Math.floor((Date.UTC(transDate.getFullYear(), transDate.getMonth(), transDate.getDate()) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / (1000 * 60 * 60 * 24));
                if(diff <= 0){
                    for(let recipe of transaction.recipes){
                        for(let merchRecipe of data.merchant.recipes){
                            if(merchRecipe._id === recipe.recipe){
                                for(let ingredient of merchRecipe.ingredients){
                                    dataList[Math.abs(diff)] += ingredient.quantity;
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