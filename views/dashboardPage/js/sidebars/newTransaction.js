let newTransaction = {
    display: function(Transaction){
        let recipeList = document.getElementById("newTransactionRecipes");
        let template = document.getElementById("createTransaction").content.children[0];
        document.getElementById("transactionFileUpload").addEventListener("click", ()=>{controller.openModal("transactionSpreadsheet")});

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let recipeDiv = template.cloneNode(true);
            recipeDiv.recipe = merchant.recipes[i];
            recipeList.appendChild(recipeDiv);

            recipeDiv.children[0].innerText = merchant.recipes[i].name;
        }

        document.getElementById("submitNewTransaction").onclick = ()=>{this.submit(Transaction)};
    },

    submit: function(Transaction){
        let recipeDivs = document.getElementById("newTransactionRecipes");
        let date = document.getElementById("newTransactionDate").valueAsDate;
        
        if(date > new Date()){
            banner.createError("CANNOT HAVE A DATE IN THE FUTURE");
            return;
        }
        
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
                        data.ingredientUpdates[ingredient.ingredient.id] += ingredient.convertToBase(ingredient.quantity) * quantity;
                    }else{
                        data.ingredientUpdates[ingredient.ingredient.id] = ingredient.convertToBase(ingredient.quantity) * quantity;
                    }
                }
            }else if(quantity < 0){
                banner.createError("CANNOT HAVE NEGATIVE VALUES");
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
                        banner.createError(response);
                    }else{
                        merchant.addTransaction(response);

                        controller.openStrand("transactions", merchant.getTransactions());
                        banner.createNotification("TRANSACTION CREATED");
                    }
                })
                .catch((err)=>{
                    banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
                })
                .finally(()=>{
                    loader.style.display = "none";
                });
        }
    },

    submitSpreadsheet: function(){
        event.preventDefault();
        controller.closeModal();

        const file = document.getElementById("spreadsheetInput").files[0];
        let data = new FormData();
        data.append("transactions", file);

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/transactions/create/spreadsheet", {
            method: "post",
            body: data
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    for(let i = 0; i < response.recipes.length; i++){
                        response.recipes[i].recipe = response.recipes[i].recipe._id;
                    }
                    merchant.addTransaction(response);

                    controller.openStrand("transactions", merchant.transactions);
                    banner.createNotification("TRANSACTION SUCCESSFULLY CREATED.  INGREDIENTS UPDATED");
                }
            })
            .catch((err)=>{
                banner.createError("UNABLE TO DISPLAY NEW TRANSACTIONS.  PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = newTransaction;