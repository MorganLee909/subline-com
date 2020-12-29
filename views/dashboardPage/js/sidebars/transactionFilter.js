let transactionFilter = {
    display: function(Transaction){
        //Set default dates
        let today = new Date();
        let monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);

        document.getElementById("transFilterDateStart").valueAsDate = monthAgo;
        document.getElementById("transFilterDateEnd").valueAsDate = today;

        //populate recipes
        let recipeList = document.getElementById("transFilterRecipeList");

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let recipe = document.createElement("div");
            recipe.innerText = merchant.recipes[i].name;
            recipe.recipe = merchant.recipes[i];
            recipe.classList.add("choosable");
            recipe.onclick = ()=>{this.toggleActive(recipe)};
            recipeList.appendChild(recipe);
        }

        //Submit button
        document.getElementById("transFilterSubmit").onclick = ()=>{this.submit(Transaction)};
    },

    toggleActive: function(element){
        if(element.classList.contains("active")){
            element.classList.remove("active");
        }else{
            element.classList.add("active");
        }
    },

    submit: function(Transaction){
        let data = {
            from: document.getElementById("transFilterDateStart").valueAsDate,
            to: document.getElementById("transFilterDateEnd").valueAsDate,
            recipes: []
        }

        data.from.setHours(0, 0, 0, 0);
        data.to.setHours(0, 0, 0, 0);

        if(data.startDate >= data.endDate){
            controller.createBanner("START DATE CANNOT BE AFTER END DATE", "error");
            return;
        }

        let recipes = document.getElementById("transFilterRecipeList").children;
        for(let i = 0; i < recipes.length; i++){
            if(recipes[i].classList.contains("active")){
                data.recipes.push(recipes[i].recipe.id);
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/transaction", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response)=>{
                let transactions = [];
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else if(response.length === 0){
                    controller.createBanner("NO TRANSACTIONS MATCH YOUR SEARCH", "error");
                }else{
                    for(let i = 0; i < response.length; i++){
                        transactions.push(new Transaction(
                            response[i]._id,
                            response[i].date,
                            response[i].recipes,
                            merchant
                        ));
                    }
                }

                controller.openStrand("transactions", transactions);
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = transactionFilter;