let newTransaction = {
    display: function(){
        let recipeList = document.getElementById("newTransactionRecipes");
        let template = document.getElementById("createTransaction").content.children[0];

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let recipeDiv = template.cloneNode(true);
            recipeDiv.recipe = merchant.recipes[i];
            recipeList.appendChild(recipeDiv);

            recipeDiv.children[0].innerText = merchant.recipes[i].name;
        }

        document.getElementById("submitNewTransaction").onclick = ()=>{this.submit()};
    },

    submit: function(){
        let recipeDivs = document.getElementById("newTransactionRecipes");
        let date = document.getElementById("newTransactionDate").valueAsDate;

        if(date === null){
            controller.createBanner("DATE IS REQUIRED FOR TRANSACTIONS", "error");
            return;
        }

        date.setHours(0, 0, 0, 0);
        
        let data = {
            date: date,
            recipes: [],
            ingredientUpdates: {}
        };

        for(let i = 0; i < recipeDivs.children.length;  i++){
            let quantity = recipeDivs.children[i].children[1].value;
            const recipe = recipeDivs.children[i].recipe;
            if(quantity !== "" && quantity > 0){
                data.recipes.push({
                    recipe: recipe.id,
                    quantity: quantity
                });

                for(let j = 0; j < recipe.ingredients.length; j++){
                    let ingredient = recipe.ingredients[j];
                    if(data.ingredientUpdates[ingredient.ingredient.id]){
                        data.ingredientUpdates[ingredient.ingredient.id] += controller.baseUnit(ingredient.quantity, ingredient.ingredient.unit) * quantity;
                    }else{
                        data.ingredientUpdates[ingredient.ingredient.id] = controller.baseUnit(ingredient.quantity, ingredient.ingredient.unit) * quantity;
                    }
                }
            }else if(quantity < 0){
                controller.createBanner("CANNOT HAVE NEGATIVE VALUES", "error");
                return;
            }
        }

        if(data.recipes.length > 0){
            let loader = document.getElementById("loaderContainer");
            loader.style.display = "flex";

            fetch("/transaction/create", {
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
                        let thirtyAgo = new Date();
                        thirtyAgo.setDate(thirtyAgo.getDate() - 30);
                        thirtyAgo.setHours(0, 0, 0);

                        if(
                            merchant.transactions.length === 0 ||
                            new Date(response.date) > thirtyAgo
                        ){
                            merchant.addTransactions([response], true);
                            state.updateTransactions();
                        }
                        let from = new Date();
                        from.setDate(from.getDate() - 7);
                        from.setHours(0, 0, 0, 0);
                        controller.openStrand("transactions", merchant.getTransactions(from, new Date()));
                        controller.createBanner("TRANSACTION CREATED", "success");
                    }
                })
                .catch((err)=>{
                    controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
                })
                .finally(()=>{
                    loader.style.display = "none";
                });
        }
    }
}

module.exports = newTransaction;