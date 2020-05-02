window.recipeBookStrandObj = {
    isPopulated: false,

    display: function(){
        if(!this.isPopulated){
            let recipeList = document.querySelector("#recipeList");

            for(let recipe of merchant.recipes){
                let recipeDiv = document.createElement("div");
                recipeDiv.classList = "recipeItem";
                recipeDiv.onclick = ()=>{this.displayRecipe(recipe)};
                recipeList.appendChild(recipeDiv);

                let recipeName = document.createElement("p");
                recipeName.innerText = recipe.name;
                recipeDiv.appendChild(recipeName);

                let recipePrice = document.createElement("p");
                recipePrice.innerText = `$${(recipe.price / 100).toFixed(2)}`;
                recipeDiv.appendChild(recipePrice);

                this.isPopulated = true;
            }
        }
    },

    displayRecipe: function(recipe){
        closeSidebar();

        document.querySelector("#recipeDetails").classList = "sidebar";

        document.querySelector("#recipeDetails h1").innerText = recipe.name;

        let ingredientList = document.querySelector("#recipeIngredients");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        for(let ingredient of recipe.ingredients){
            let ingredientDiv = document.createElement("div");
            ingredientDiv.classList = "recipeIngredient";
            ingredientList.appendChild(ingredientDiv);

            let ingredientName = document.createElement("p");
            ingredientName.innerText = ingredient.ingredient.name;
            ingredientDiv.appendChild(ingredientName);

            let ingredientQuantity = document.createElement("p");
            ingredientQuantity.innerText = `${ingredient.quantity} ${ingredient.ingredient.unit}`;
            ingredientDiv.appendChild(ingredientQuantity);
        }

        document.querySelector("#recipePrice p").innerText = `$${(recipe.price / 100).toFixed(2)}`;
    }
}