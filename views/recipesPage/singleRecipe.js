let singleRecipeObj = {
    display: function(recipe){
        controller.clearScreen();
        controller.singleRecipeStrand.style.display = "flex";

        let tbody = document.querySelector("tbody");

        while(tbody.children.length > 0){
            tbody.removeChild(tbody.firstChild);
        }

        document.querySelector("#recipeName").innerText = recipe.name;
        document.querySelector("#addButton").onclick = ()=>{this.displayAdd(recipe)};

        for(let ingredient of recipe.ingredients){
            let row = document.createElement("tr");
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
            editButton.classList = "button-small";
            editButton.onclick = ()=>{this.editIngredient(row, ingredient, recipe);};
            actions.appendChild(editButton);

            let removeButton = document.createElement("button");
            removeButton.innerText = "Remove";
            removeButton.classList = "button-small";
            removeButton.onclick = ()=>{this.deleteIngredient(recipe._id, ingredient._id, row);};
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
        
        for(let ingredient of recipe.ingredients){
            if(ingredient.ingredient._id === ingredientId){
                banner.createError("That ingredient is already in this recipe");
                return;
            }
        }
        
        axios.post("/merchant/recipes/ingredients/create", {recipeId: recipe._id, item: item})
            .then((response)=>{
                if(typeof(response.data) === "string"){
                    banner.createError(response.data);
                }else{
                    for(let i = 0; i < merchant.recipes.length; i++){
                        if(merchant.recipes[i]._id === recipe._id){
                            merchant.recipes.splice(i, 1);
                            break;
                        }
                    }
                    merchant.recipes.push(response.data);
                    recipesObj.isPopulated = false;

                    //Change row from displaying options to showing default display
                    while(row.children.length > 0){
                        row.removeChild(row.firstChild);
                    }

                    let addIngredient = merchant.inventory.find(i => i.ingredient._id === ingredientId);

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
                    editButton.onclick = ()=>{this.editIngredient(row, addIngredient, recipe);};
                    actions.appendChild(editButton);

                    let removeButton = document.createElement("button");
                    removeButton.innerText = "Remove";
                    removeButton.onclick = ()=>{this.deleteIngredient(recipe._id, ingredientId, row);};
                    actions.appendChild(removeButton);
                }
            })
            .catch((err)=>{
                row.parentNode.removeChild(row);
                banner.createError("There was an error and the recipe could not be updated");
            });
    },

    //Delete ingredient from table
    //Delete ingredient from database
    deleteIngredient: function(recipeId, ingredientId, row){
        
        
        axios.post("/merchant/recipes/ingredients/remove", {ingredientId: ingredientId, recipeId: recipeId})
            .then((result)=>{
                if(typeof(result.data) === "string"){
                    banner.createError(result.data);
                }else{
                    row.parentNode.removeChild(row);

                    let updateRecipe = merchant.recipes.find(r => r._id === recipeId);
                    for(let i = 0; i < updateRecipe.ingredients.length; i++){
                        if(updateRecipe.ingredients[i]._id === ingredientId){
                            updateRecipe.ingredients.splice(i, 1);
                            break;
                        }
                    }

                    recipesObj.isPopulated = false;
                }
            })
            .catch((err)=>{
                banner.createError("There was an error and the ingredient could not be removed from the recipe");
            });
    },

    //Change quantity field to input
    //Change edit button
    editIngredient: function(row, ingredient, recipe){
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
        button.onclick = ()=>{this.updateIngredient(row, ingredient, recipe);}; 
    },

    updateIngredient: function(row, ingredient, recipe){
        let originalQuantity = ingredient.quantity;
        ingredient.quantity = row.children[1].children[0].value;

        let td = row.children[1];
        while(td.children.length > 0){
            td.removeChild(td.firstChild);
        }

        let button = row.children[2].children[0];
        button.innerText = "Edit";
        button.onclick = ()=>{this.editIngredient(row, ingredient, recipe);};

        axios.post("/merchant/recipes/ingredients/update", {recipeId: recipe._id, ingredient: ingredient})
            .then((result)=>{
                if(typeof(result.data) === "string"){
                    banner.createError(result.data);
                }else{
                    td.innerText = `${ingredient.quantity} ${ingredient.ingredient.unit}`;
                    banner.createNotification("Ingredient successfully updated");
                }
            })
            .catch((err)=>{
                td.innerText = `${originalQuantity} ${ingredient.ingredient.unit}`;
                banner.createError("There was an error and the ingredient could not be updated");
            });
    },
}