let recipesPage = {
    currentRecipe: {},
    //Display all recipes on a card
    displayRecipes: function(){
        document.querySelector("#recipes").style.display = "flex";
        document.querySelector("#ingredient").style.display = "none";

        let body = document.querySelector("#recipesContainer");

        currentRecipe = {};

        while(body.children.length > 0){
            body.removeChild(body.firstChild);
        }
        
        for(let recipe of merchant.recipes){
            let recipeDiv = document.createElement("div");
            recipeDiv.classList = "recipe-card";
            recipeDiv.onclick = ()=>{this.displayOneRecipe(recipe._id)};
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
    displayOneRecipe: function(recipeId){
        let recipesDiv = document.querySelector("#recipes");
        let ingredientDiv = document.querySelector("#ingredient");
        let tbody = document.querySelector("tbody");
        let title = document.querySelector("#title");

        while(tbody.children.length > 0){
            tbody.removeChild(tbody.firstChild);
        }

        this.currentRecipe = merchant.recipes.find(r => r._id === recipeId);

        document.querySelector("#addButton").onclick = ()=>{this.displayAdd(this.currentRecipe)};
        title.innerText = this.currentRecipe.name;

        recipesDiv.style.display = "none";
        ingredientDiv.style.display = "flex";

        for(let ingredient of this.currentRecipe.ingredients){
            let row = document.createElement("tr");
            row.recipeId = this.currentRecipe._id;
            tbody.appendChild(row);

            let name = document.createElement("td");
            name.innerText = ingredient.ingredient.name;
            row.appendChild(name);

            let quantity = document.createElement("td");
            quantity.innerText = `${ingredient.quantity} ${ingredient.ingredient.unit}`;
            row.appendChild(quantity);

            let actions = document.createElement("td");
            row.appendChild(actions);

            let editButton = document.createElement("button");
            editButton.innerText = "Edit";
            editButton.onclick = ()=>{this.editIngredient(row, ingredient);};
            actions.appendChild(editButton);

            let removeButton = document.createElement("button");
            removeButton.innerText = "Remove";
            removeButton.onclick = ()=>{this.deleteIngredient(recipeId, ingredient._id, row);};
            actions.appendChild(removeButton);
        }
    },

    displayAdd: function(recipe){
        let tbody = document.querySelector("tbody");

        let row = document.createElement("tr");
        tbody.appendChild(row);

        let nameTd = document.createElement("td");
        row.appendChild(nameTd);
        let name = document.createElement("select");
        nameTd.appendChild(name);

        for(let item of merchant.inventory){
            let nameOption = document.createElement("option");
            nameOption.innerText = item.ingredient.name;
            nameOption.value = item.ingredient._id;
            name.appendChild(nameOption);
        }

        let quantityTd = document.createElement("td");
        row.appendChild(quantityTd);
        let quantity = document.createElement("input");
        quantity.type = "text";
        quantity.step = "0.01";
        quantityTd.appendChild(quantity);

        let actionTd = document.createElement("td");
        row.appendChild(actionTd);

        let saveButton = document.createElement("button");
        saveButton.innerText = "Save";
        actionTd.appendChild(saveButton);
        saveButton.onclick = ()=>{this.addIngredient(recipe, name.value, quantity.value, row);};
    },

    addIngredient: function(recipe, ingredientId, quantity, row){
        let item = {
            ingredient: ingredientId,
            quantity: quantity
        }
        
        axios.post("/merchant/recipes/ingredients/create", {recipeId: recipe._id, item: item})
            .then((newMerchant)=>{
                let addIngredient = merchant.inventory.find(i => i.ingredient._id === ingredientId);
                recipe.ingredients.push({
                    ingredient: addIngredient.ingredient,
                    quantity: item.quantity
                });

                //Change row from displaying options to showing default display
                while(row.children.length > 0){
                    row.removeChild(row.firstChild);
                }

                let name = document.createElement("td");
                name.innerText = addIngredient.ingredient.name;
                row.appendChild(name);

                let quantity = document.createElement("td");
                quantity.innerText = `${item.quantity} ${addIngredient.ingredient.unit}`;
                row.appendChild(quantity);

                let actions = document.createElement("td");
                row.appendChild(actions);

                let editButton = document.createElement("button");
                editButton.innerText = "Edit";
                editButton.onclick = ()=>{this.editIngredient(row, addIngredient);};
                actions.appendChild(editButton);

                let removeButton = document.createElement("button");
                removeButton.innerText = "Remove";
                removeButton.onclick = ()=>{this.deleteIngredient(recipe._id, ingredientId, row);};
                actions.appendChild(removeButton);

                banner.createNotification("Ingredient successfully added to database");
            })
            .catch((err)=>{
                row.parentNode.removeChild(row);
                console.log(err);
                banner.createError("There was an error and the recipe could not be updated");
            });
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
        
        axios.post("/merchant/recipes/ingredients/remove", {ingredientId: ingredientId, recipeId: recipeId})
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
        para.innerText = ingredient.ingredient.unit;
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
        td.innerText = `${ingredient.quantity} ${ingredient.ingredient.unit}`;

        let button = row.children[2].children[0];
        button.innerText = "Edit";
        button.onclick = ()=>{this.editIngredient(row, ingredient);};
        console.log(this.currentRecipe._id);

        axios.post("/merchant/recipes/ingredients/update", {recipeId: this.currentRecipe._id, ingredient: ingredient})
            .then((recipe)=>{
                banner.createNotification("Ingredient successfully updated");
            })
            .catch((err)=>{
                console.log(err);
                banner.createError("There was an error and the ingredient could not be updated");
            });
    },

    updateRecipes: function(){
        axios.get("/merchant/recipes/update")
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