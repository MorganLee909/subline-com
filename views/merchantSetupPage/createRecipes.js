let createRecipesObj = {
    recipeIndex: 0,
    
    display: function(){
        controller.clearScreen();
        controller.createRecipesStrand.style.display = "flex";

        if(recipes){
            controller.data.recipes = [];

            for(let recipe of recipes.elements){
                controller.data.recipes.push({
                    name: recipe.name,
                    posId: recipe.id,
                    price: recipe.price,
                    ingredients: [],
                });
            }
        }

        this.showRecipe();
    },

    //Loops through recipeData to create td's
    //Displays each ingredient for current recipe
    //Create and display correct buttons for navigation
    showRecipe: function(){
        let title = document.querySelector("#recipeName");
        title.innerText = controller.data.recipes[this.recipeIndex].name;

        if(!recipes){
            document.querySelector("#price").value = controller.data.recipes[this.recipeIndex].price || 0;
        }

        let tbody = document.querySelector("#createRecipesStrand tbody");

        if(controller.data.recipes[this.recipeIndex].ingredients.length <= 0){
            document.querySelector("#createRecipesStrand table").style.display = "none";
        }else{
            document.querySelector("#createRecipesStrand table").style.display = "table";
        }

        for(let recipeIngredient of controller.data.recipes[this.recipeIndex].ingredients){
            let row = document.createElement("tr");
            tbody.appendChild(row);
    
            let ingredientTd = document.createElement("td");
            row.appendChild(ingredientTd);

            let ingredientName = document.createElement("select");
            for(let inventoryIngredient of controller.data.inventory){
                let newOption = document.createElement("option");
                newOption.innerText = inventoryIngredient.ingredient.name;
                newOption.value = inventoryIngredient.ingredient.id;
                if(inventoryIngredient.ingredient.id === recipeIngredient.ingredient){
                    newOption.selected = "selected";
                }
                ingredientName.appendChild(newOption);
            }
            ingredientTd.appendChild(ingredientName);
    
            let quantityTd = document.createElement("td");
            row.appendChild(quantityTd);

            let ingQuant = document.createElement("input");
            ingQuant.type = "number";
            ingQuant.step = "0.01";
            ingQuant.value = recipeIngredient.quantity;
            ingQuant.onblur = ()=>{controller.checkValid("quantity", ingQuant)};
            quantityTd.appendChild(ingQuant);

            let actionTd = document.createElement("td");
            row.appendChild(actionTd);

            let removeButton = document.createElement("button");
            removeButton.innerText = "Remove";
            removeButton.classList = "button-small";
            removeButton.onclick = ()=>{this.removeRow(row)};
            actionTd.appendChild(removeButton);
        }
    
        let nextButton = document.querySelector("#next");
        nextButton.onclick = ()=>{this.changeRecipe(1)};
        if(this.recipeIndex === controller.data.recipes.length - 1){
            nextButton.innerText = "Finish";
        }else{
            nextButton.innerText = "Next Recipe";
        }
    
        let previousButton = document.querySelector("#previous");
        if(this.recipeIndex === 0){
            previousButton.style.display = "none";
        }else{
            previousButton.style.display = "inline-block";
        }
    },

    //Adds ingredient data to recipeData
    //Empties all data in the table
    //Changes recipeDataIndex
    //Hands off to showRecipe function
    changeRecipe: function(num){
        let tbody = document.querySelector("#createRecipesStrand tbody");
        controller.data.recipes[this.recipeIndex].ingredients = [];
        if(!recipes){
            controller.data.recipes[this.recipeIndex].price = Math.floor(document.querySelector("#price").value * 100);
        }
        let isValid = true;
        
    
        for(let row of tbody.children){
            let quantity = row.children[1].children[0].value;

            if(validator.ingredient.quantity(quantity)){
                controller.data.recipes[this.recipeIndex].ingredients.push({
                    ingredient: row.children[0].children[0].value,
                    quantity: quantity
                });
            }else{
                isValid = false;
                break;
            }
        }

        this.recipeIndex += num

        if(isValid){
            if(this.recipeIndex > controller.data.recipes.length - 1){
                this.submit();
            }else{
                while(tbody.children.length > 0){
                    tbody.removeChild(tbody.firstChild);
                }

                this.showRecipe();
            }
        }
    },

    //Creates a new, empty row in table to input data
    addRecipeIngredientField: function(){
        let tbody = document.querySelector("#createRecipesStrand tbody");
        document.querySelector("#createRecipesStrand table").style.display = "table";
    
        let row = document.createElement("tr");
        tbody.appendChild(row);
    
        let ingTd = document.createElement("td");
        row.appendChild(ingTd);

        let ingName = document.createElement("select");
        for(let ingredient of controller.data.inventory){
            let newOption = document.createElement("option");
            newOption.innerText = ingredient.ingredient.name;
            newOption.value = ingredient.ingredient.id;
            ingName.appendChild(newOption);
        }
        ingTd.appendChild(ingName);
    
        let quantTd = document.createElement("td");
        row.appendChild(quantTd);

        let ingQuant = document.createElement("input");
        ingQuant.type = "number";
        ingQuant.step = "0.01";
        ingQuant.min = "0";
        ingQuant.onblur = ()=>{controller.checkValid("quantity", ingQuant)};
        quantTd.appendChild(ingQuant);
    
        let removeTd = document.createElement("td");
        row.appendChild(removeTd);
        
        let removeButton = document.createElement("button");
        removeButton.innerText = "Remove";
        removeButton.classList = "button-small";
        removeButton.onclick = ()=>{this.removeRow(row)};
        removeTd.appendChild(removeButton);
    },

    removeRow: function(row){
        let tbody = document.querySelector("#createRecipesStrand tbody");

        row.parentNode.removeChild(row);

        if(tbody.children.length <= 0){
            document.querySelector("#createRecipesStrand table").style.display = "none";
        }
    },

    //Add all recipes to data variable
    //Creates a form and submits data
    submit: function(){        
        let form = document.createElement("form");
        form.method = "post";
        form.action = recipes ? "/merchant/clover/create" : "/merchant/none/create";
        form.style.display = "none";
        
        let dataInput = document.createElement("input");
        dataInput.type = "hidden";
        dataInput.name = "data";
        dataInput.value = JSON.stringify(controller.data);
    
        form.appendChild(dataInput);
        document.body.appendChild(form);
        form.submit();
    }
}