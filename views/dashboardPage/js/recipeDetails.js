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
                controller.openSidebar("ingredientDetails", recipe.ingredients[i]);
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
                    banner.createError(response);
                }else{
                    merchant.removeRecipe(recipe);

                    banner.createNotification("RECIPE REMOVED");
                    controller.openStrand("recipeBook");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    displayAddIngredient: function(){
        let template = document.getElementById("addRecIngredient").content.children[0].cloneNode(true);
        template.name = "new";
        document.getElementById("recipeIngredientList").appendChild(template);

        let categories = merchant.categorizeIngredients();

        for(let i = 0; i < categories.length; i++){
            let optGroup = document.createElement("optgroup");
            optGroup.label = categories[i].name;
            template.children[0].appendChild(optGroup);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let option = document.createElement("option");
                option.innerText = `${categories[i].ingredients[j].ingredient.name} (${categories[i].ingredients[j].ingredient.unit})`;
                option.ingredient = categories[i].ingredients[j].ingredient;
                optGroup.appendChild(option);
            }
        }
    }
}

module.exports = recipeDetails;