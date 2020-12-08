let recipeDetails = {
    display: function(recipe){
        document.getElementById("editRecipeBtn").onclick = ()=>{controller.openSidebar("editRecipe", recipe)};
        document.getElementById("recipeName").innerText = recipe.name;
        if(merchant.pos === "none"){
            document.getElementById("removeRecipeBtn").onclick = ()=>{this.remove(recipe)};
        }

        //ingredient list
        let ingredientsDiv = document.getElementById("recipeIngredientList");

        while(ingredientsDiv.children.length > 0){
            ingredientsDiv.removeChild(ingredientsDiv.firstChild);
        }

        let template = document.getElementById("recipeIngredient").content.children[0];
        for(let i = 0; i < recipe.ingredients.length; i++){
            let recipeDiv = template.cloneNode(true);
            recipeDiv.children[0].innerText = recipe.ingredients[i].ingredient.name;
            recipeDiv.children[1].innerText = `${recipe.ingredients[i].getQuantityDisplay()}`;
            recipeDiv.onclick = ()=>{
                controller.openStrand("ingredients");
                controller.openSidebar("ingredientDetails", merchant.getIngredient(recipe.ingredients[i].ingredient.id));
            }
            ingredientsDiv.appendChild(recipeDiv);
        }

        document.getElementById("recipePrice").children[1].innerText = `$${recipe.price.toFixed(2)}`;
    },

    remove: function(recipe){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/recipe/remove/${recipe.id}`, {
            method: "delete"
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    merchant.removeRecipe(recipe);

                    controller.createBanner("RECIPE REMOVED", "success");
                    controller.openStrand("recipeBook");
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

module.exports = recipeDetails;