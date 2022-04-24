let newTransaction = {
    display: function(){
        document.getElementById("sidebarDiv").classList.add("sidebarWide");
        document.getElementById("newTransactionDate").valueAsDate = new Date();

        let recipeList = document.getElementById("newTransAvailable");
        recipeList.children[0].onkeyup = ()=>{this.searchRecipes()};
        while(recipeList.children.length > 1){
            recipeList.removeChild(recipeList.lastChild);
        }

        let transAdded = document.getElementById("newTransactionRecipes");
        while(transAdded.children.length > 0){
            transAdded.removeChild(transAdded.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let button = document.createElement("button");
            button.classList.add("choosable");
            button.innerText = merchant.recipes[i].name;
            button.onclick = ()=>{this.add(merchant.recipes[i], button)};
            recipeList.appendChild(button);
        }

        document.getElementById("submitNewTransaction").onclick = ()=>{this.submit()};
    },

    add: function(recipe, element){
        element.style.display = "none";

        let template = document.getElementById("createTransaction").content.children[0].cloneNode(true);
        template.children[0].children[0].innerText = recipe.name;
        template.children[0].children[1].onclick = ()=>{
            template.parentElement.removeChild(template);
            element.style.display = "flex";
        };
        template.recipe = recipe;
        document.getElementById("newTransactionRecipes").appendChild(template);
    },

    searchRecipes: function(){
        let items = document.getElementById("newTransAvailable").children;
        let searchString = items[0].value.toLowerCase();

        if(searchString === ""){
            for(let i = 1; i < items.length; i++){
                items[i].style.display = "flex";
            }
        }else{
            for(let i = 1; i < items.length; i++){
                if(items[i].innerText.toLowerCase().includes(searchString)){
                    items[i].style.display = "flex";
                }else{
                    items[i].style.display = "none";
                }
            }
        }
    },

    submit: function(){
        let recipeDivs = document.getElementById("newTransactionRecipes");
        let date = document.getElementById("newTransactionDate").valueAsDate;

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

                let keys = Object.keys(recipe.ingredientTotals);

                for(let j = 0; j < keys.length; j++){
                    if(data.ingredientUpdates[keys[j]] === undefined){
                        data.ingredientUpdates[keys[j]] = recipe.ingredientTotals[keys[j]] * quantity;
                    }else{
                        data.ingredientUpdates[keys[j]] += recipe.ingredientTotals[keys[j]] * quantity
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