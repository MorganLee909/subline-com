let recipesPage = {
    //Display all recipes on a card
    displayRecipes: function(){
        let body = document.querySelector(".container");

        while(body.children.length > 0){
            body.removeChild(body.firstChild);
        }
        
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

    //Display a single recipe with all of its ingredients
    displayOneRecipe: function(recipe){
        let recipesDiv = document.querySelector("#recipes");
        let ingredientDiv = document.querySelector("#ingredient");
        let tbody = document.querySelector("tbody");
        let title = document.querySelector("#title");
        title.innerText = recipe.name;

        recipesDiv.style.display = "none";
        ingredientDiv.style.display = "flex";

        let delRecipe = document.querySelector("#delRecipe");
        delRecipe.style.display = "inline-block";
        delRecipe.onclick = ()=>{this.deleteRecipe(recipe);};

        for(let ingredient of recipe.ingredients){
            let row = document.createElement("tr");
            row.recipeId = recipe._id;
            tbody.appendChild(row);

            let name = document.createElement("td");
            name.innerText = ingredient.id.name;
            row.appendChild(name);

            let quantity = document.createElement("td");
            quantity.innerText = `${ingredient.quantity} ${ingredient.id.unitType}`;
            row.appendChild(quantity);

            let actions = document.createElement("td");
            row.appendChild(actions);

            let editButton = document.createElement("button");
            editButton.innerText = "Edit";
            editButton.onclick = ()=>{this.editIngredient(row, ingredient);};
            actions.appendChild(editButton);

            let removeButton = document.createElement("button");
            removeButton.innerText = "Remove";
            removeButton.onclick = ()=>{this.deleteIngredient(recipe._id, ingredient._id, row);};
            actions.appendChild(removeButton);
        }
    },

    //Delete ingredient from table
    //Delete ingredient from database
    deleteIngredient: function(recipeId, ingredientId, row){
        row.parentNode.removeChild(row);
        
        axios.post("/recipes/ingredients/remove", {recipeId: recipeId, ingredientId:ingredientId})
            .then((result)=>{
                banner.createNotification("Ingredient has been removed from recipe");
            })
            .catch((err)=>{
                banner.createError("There was an error and the ingredient could not be removed from the recipe");
                console.log(err);
            });
    },


    //Change quantity field to input
    //Change edit button
    editIngredient: function(row, ingredient){
        let td = row.children[1];
        td.innerText = "";

        let input = document.createElement("input");
        input.type = "number";
        input.step = "0.01";
        input.value = ingredient.quantity;
        td.appendChild(input);

        let para = document.createElement("p");
        para.innerText = ingredient.id.unitType;
        td.appendChild(para);

        let button = row.children[2].children[0];
        button.innerText = "Save";
        button.onclick = ()=>{this.updateIngredient(row, ingredient);}; 
    },

    updateIngredient: function(row, ingredient){
        ingredient.quantity = row.children[1].children[0].value;
        let td = row.children[1];
        while(td.children.length > 0){
            td.removeChild(td.firstChild);
        }
        td.innerText = `${ingredient.quantity} ${ingredient.id.unitType}`;

        let button = row.children[2].children[0];
        button.innerText = "Edit";
        button.onclick = ()=>{this.editIngredient(row, ingredient);};

        axios.post("/recipes/ingredients/update", {recipeId: row.recipeId, ingredient: ingredient})
            .then((recipe)=>{
                banner.createNotification("Ingredient successfully updated");
            })
            .catch((err)=>{
                console.log(err);
                banner.createError("There was an error and the ingredient could not be updated");
            });
    },

    deleteRecipe: function(recipe){
        for(let i = 0; i < recipes.length; i++){
            if(recipes[i]._id === recipe._id){
                recipes.splice(i, 1);
                break;
            }
        }

        let ingredientDiv = document.querySelector("#ingredient");
        let recipesDiv = document.querySelector("#recipes");
        ingredientDiv.style.display = "none";
        recipesDiv.style.display = "flex";
        this.displayRecipes();

        axios.post("recipes/remove", {id: recipe._id})
            .then((recipe)=>{
                banner.createNotification("Recipe removed");
            })
            .catch((err)=>{
                console.log(err);
                banner.createError("There was an error and the recipe could not be removed");
            });
    }
}

recipesPage.displayRecipes();