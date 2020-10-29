const Transaction = require("./Transaction");

let transactionFilter = {
    display: function(){
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
        document.getElementById("transFilterSubmit").onclick = ()=>{this.submit()};
    },

    toggleActive: function(element){
        if(element.classList.contains("active")){
            element.classList.remove("active");
        }else{
            element.classList.add("active");
        }
    },

    submit: function(){
        let data = {
            startDate: document.getElementById("transFilterDateStart").valueAsDate,
            endDate: document.getElementById("transFilterDateEnd").valueAsDate,
            recipes: []
        }

        if(data.startDate >= data.endDate){
            banner.createError("START DATE CANNOT BE AFTER END DATE");
            return;
        }

        let recipes = document.getElementById("transFilterRecipeList").children;
        for(let i = 0; i < recipes.length; i++){
            if(recipes[i].classList.contains("active")){
                data.recipes.push(recipes[i].recipe.id);
            }
        }

        if(data.recipes.length === 0){
            for(let i = 0; i < merchant.recipes.length; i++){
                data.recipes.push(merchant.recipes[i].id);
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
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    let transactions = [];
                    for(let i = 0; i < response.length; i++){
                        transactions.push(new Transaction(
                            response[i]._id,
                            response[i].date,
                            response[i].recipes,
                            merchant
                        ));
                    }

                    controller.openStrand("transactions", transactions);
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = transactionFilter;