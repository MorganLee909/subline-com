let ingredientDetails = {
    dailyUse: 0,

    display: function(ingredient){
        document.getElementById("editIngBtn").onclick = ()=>{controller.openSidebar("editIngredient", ingredient)};
        document.getElementById("removeIngBtn").onclick = ()=>{this.remove(ingredient)};
        document.getElementById("ingredientDetailsCategory").innerText = ingredient.ingredient.category;
        document.getElementById("ingredientDetailsName").innerText = ingredient.ingredient.name;
        document.getElementById("ingredientStock").innerText = ingredient.getQuantityDisplay();


        //Calculate and display average daily use
        let quantities = [];
        let now = new Date();
        for(let i = 1; i < 31; i++){
            let endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
            let startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i - 1);

            quantities.push(merchant.getSingleIngredientSold(ingredient, startDay, endDay));
        }

        let sum = 0;
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
        }

        let dailyUse = sum / quantities.length;
        const dailyUseDiv = document.getElementById("dailyUse");
        dailyUseDiv.innerText = `${dailyUse.toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;

        //Show recipes that this ingredient is a part of
        let recipeList = document.getElementById("ingredientRecipeList");
        let template = document.getElementById("ingredientRecipe").content.children[0];
        let recipes = merchant.getRecipesForIngredient(ingredient.ingredient);

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < recipes.length; i++){
            let recipeDiv = template.cloneNode(true);
            recipeDiv.children[0].innerText = recipes[i].name;
            recipeDiv.onclick = ()=>{
                controller.openStrand("recipeBook");
                controller.openSidebar("recipeDetails", recipes[i]);
            }
            recipeDiv.classList.add("choosable");
            recipeList.appendChild(recipeDiv);
        }
    },

    remove: function(ingredient){
        for(let i = 0; i < merchant.recipes.length; i++){
            for(let j = 0; j < merchant.recipes[i].ingredients.length; j++){
                if(ingredient.ingredient === merchant.recipes[i].ingredients[j].ingredient){
                    controller.createBanner("MUST REMOVE INGREDIENT FROM ALL RECIPES BEFORE REMOVING FROM INVENTORY", "error");
                    return;
                }
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/ingredients/remove/${ingredient.ingredient.id}`, {
            method: "delete",
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    merchant.removeIngredient(ingredient);
                    state.updateIngredients();
                    
                    controller.openStrand("ingredients");
                    controller.createBanner("INGREDIENT REMOVED", "success");
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

module.exports = ingredientDetails;