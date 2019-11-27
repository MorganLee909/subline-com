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
    
        let tbody = document.querySelector("#recipeTable tbody");
        for(let recipeIngredient of controller.data.recipes[this.recipeIndex].ingredients){
            let row = document.createElement("tr");
            tbody.appendChild(row);
    
            let ingredientTd = document.createElement("td");
            row.appendChild(ingredientTd);
            let ingredientName = document.createElement("select");
            for(let inventoryIngredient of controller.data.ingredients){
                let newOption = document.createElement("option");
                newOption.innerText = inventoryIngredient.name;
                newOption.value = inventoryIngredient.id;
                if(inventoryIngredient.id === recipeIngredient.id){
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
            ingQuant.onblur = ()=>{checkValid("quantity", ingQuant)};
            quantityTd.appendChild(ingQuant);
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
        let tbody = document.querySelector("#recipeTable tbody");
        controller.data.recipes[this.recipeIndex].ingredients = [];
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

        if(isValid){
            if(this.recipeIndex >= controller.data.recipes.length - 1){
                this.submit();
            }else{
                while(tbody.children.length > 0){
                    tbody.removeChild(tbody.firstChild);
                }

                this.recipeIndex += num;
                this.showRecipe();
            }
        }
    },

    //Creates a new, empty row in table to input data
    addRecipeIngredientField: function(){
        let tbody = document.querySelector("#recipeTable tbody");
    
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
        removeButton.innerText = "-";
        removeButton.onclick = ()=>{row.parentNode.removeChild(row)};
        removeTd.appendChild(removeButton);
    },

    //Add all recipes to data variable
    //Creates a form and submits data
    submit: function(){        
        let form = document.createElement("form");
        form.method = "post";
        form.action = recipes ? "/merchant/clover/create" : "/merchant/none/create";
        
        let dataInput = document.createElement("input");
        dataInput.type = "hidden";
        dataInput.name = "data";
        dataInput.value = JSON.stringify(controller.data);
    
        form.appendChild(dataInput);
        document.body.appendChild(form);
        form.submit();
    }
}