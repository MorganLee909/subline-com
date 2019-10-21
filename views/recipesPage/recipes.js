let recipesPage = {
    //Display all recipes on a card
    displayRecipes: function(){
        let body = document.querySelector(".container");
        let recipeUpdate = document.querySelector("#recipeUpdate");

        recipeUpdate.style.display = "inline-block";

        while(body.children.length > 0){
            body.removeChild(body.firstChild);
        }
        
        for(let recipe of merchant.recipes){
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
                ul.innerText = ingredient.ingredient.name;
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
        let recipeUpdate = document.querySelector("#recipeUpdate");
        title.innerText = recipe.name;

        recipesDiv.style.display = "none";
        ingredientDiv.style.display = "flex";
        recipeUpdate.style.display = "none";

        for(let ingredient of recipe.ingredients){
            let row = document.createElement("tr");
            row.recipeId = recipe._id;
            tbody.appendChild(row);

            let name = document.createElement("td");
            name.innerText = ingredient.ingredient.name;
            row.appendChild(name);

            let quantity = document.createElement("td");
            quantity.innerText = `${ingredient.quantity} ${ingredient.ingredient.unitType}`;
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

        let updateRecipe = merchant.recipes.find(r => r._id === recipeId);
        for(let i = 0; i < updateRecipe.ingredients.length; i++){
            if(updateRecipe.ingredients[i]._id === ingredientId){
                updateRecipe.ingredients.splice(i, 1);
                break;
            }
        }
        
        axios.post("/merchant/update", merchant)
            .then((result)=>{
                merchant = result;
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
        para.innerText = ingredient.ingredient.unitType;
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
        td.innerText = `${ingredient.quantity} ${ingredient.ingredient.unitType}`;

        let button = row.children[2].children[0];
        button.innerText = "Edit";
        button.onclick = ()=>{this.editIngredient(row, ingredient);};

        axios.post("/merchant/update", merchant)
            .then((recipe)=>{
                banner.createNotification("Ingredient successfully updated");
            })
            .catch((err)=>{
                console.log(err);
                banner.createError("There was an error and the ingredient could not be updated");
            });
    },

    updateRecipes: function(){
        axios.get("/recipes/update")
            .then((result)=>{
                merchant = result.data.merchant;
                this.displayRecipes();
                banner.createNotification("Your recipes have been updated successfully");
                if(result.data.count > 0){
                    banner.createError(`You have ${result.data.count} recipes with no ingredients.  Please update them.`);
                }
            })
            .catch((err)=>{
                console.log(err);
                banner.createError("There was an error and your recipes could not be updated");
            });
    }
}

recipesPage.displayRecipes();