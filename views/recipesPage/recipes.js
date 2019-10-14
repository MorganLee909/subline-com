console.log(recipes);

let recipesPage = {
    //Display all recipes on a card
    displayRecipes: function(){
        let body = document.querySelector(".container");
        
        for(let recipe of recipes){
            let recipeDiv = document.createElement("div");
            recipeDiv.classList = "recipe-card";
            recipeDiv.onclick = ()=>{this.displayOneRecipe(recipe)};
            body.appendChild(recipeDiv);

            let title = document.createElement("h2");
            title.innerText = recipe.name;
            recipeDiv.appendChild(title);

            let ingredientList = document.createElement("ul");
            recipeDiv.appendChild(ingredientList);

            for(let ingredient of recipe.ingredients){
                let ul = document.createElement("li");
                ul.innerText = ingredient.id.name;
                ingredientList.appendChild(ul);
            }
        }
    },

    displayOneRecipe: function(recipe){
        let recipesDiv = document.querySelector("#recipes");
        let ingredientDiv = document.querySelector("#ingredient");
        let tbody = document.querySelector("tbody");

        recipesDiv.style.display = "none";
        ingredientDiv.style.display = "flex";

        for(let ingredient of recipe.ingredients){
            let row = document.createElement("tr");
            tbody.appendChild(row);

            let name = document.createElement("td");
            name.innerText = ingredient.id.name;
            row.appendChild(name);

            let quantity = document.createElement("td");
            quantity.innerText = `${ingredient.quantity} ${ingredient.id.unitType}`;
            row.appendChild(quantity);

            let actions = document.createElement("td");
            row.appendChild(actions);

            let removeButton = document.createElement("button");
            removeButton.innerText = "Remove";
            removeButton.onclick = ()=>{deleteIngredient(ingredient);};
            actions.appendChild(removeButton);

        }
    },

    deleteIngredient: function(ingredient){
        
    }
}

recipesPage.displayRecipes();