let recipesObj = {
    isPopulated: false,

    display: function(){
        controller.clearScreen();
        controller.recipesStrand.style.display = "flex";

        if(!this.isPopulated){
            this.populateRecipes();
            this.isPopulated = true;
        }
    },

    populateRecipes: function(){
        let body = document.querySelector("#recipesContainer");

        while(body.children.length > 0){
            body.removeChild(body.firstChild);
        }

        merchant.recipes.sort((a, b) => (a.name > b.name)? 1 : -1);
        
        for(let recipe of merchant.recipes){
            let recipeDiv = document.createElement("div");
            recipeDiv.classList = "recipe-card";
            recipeDiv.onclick = ()=>{singleRecipeObj.display(recipe)};
            body.appendChild(recipeDiv);

            if(recipe.ingredients.length === 0){
                recipeDiv.classList = "recipe-card empty-recipe";
            }else{
                recipeDiv.classList = "recipe-card";
            }

            let title = document.createElement("h2");
            title.innerText = recipe.name;
            recipeDiv.appendChild(title);

            let ingredientList = document.createElement("ul");
            recipeDiv.appendChild(ingredientList);

            for(let ingredient of recipe.ingredients){
                let ul = document.createElement("li");
                ul.innerText = ingredient.ingredient.name;
                ingredientList.appendChild(ul);
            }
        }
    },

    updateRecipes: function(){
        axios.get("/merchant/recipes/update")
            .then((result)=>{
                if(typeof(result.data) === "string"){
                    banner.createError(result.data);
                }else{
                    merchant = result.data.merchant;
                    this.populateRecipes();
                    banner.createNotification("Your recipes have been updated successfully");
                    if(result.data.count > 0){
                        banner.createError(`You have ${result.data.count} recipes with no ingredients.  Please update them.`);
                    }
                }
            })
            .catch((err)=>{
                banner.createError("There was an error and your recipes could not be updated");
            });
    }
}