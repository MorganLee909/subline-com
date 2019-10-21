let recipeSetup = {
    recipeData: [],  //stores data from recipes, including ingredients
    recipeDataIndex: 0,  //index for recipeData, which one is currently displaying

    //Display recipe page and hide others
    //Populate recipeData with data from Clover
    createRecipePage: function(){
        addIngredients.style.display = "none";
        newIngredients.style.display = "none";
        createRecipes.style.display = "flex";

        for(let recipe of recipes.elements){
            this.recipeData.push(
                {
                    id: recipe.id,
                    name: recipe.name,
                    ingredients: []
                }
            )
        }

        this.showRecipe();
    },

    //Loops through recipeData to create td's
    //Displays each ingredient for current recipe
    //Create and display correct buttons for navigation
    showRecipe: function(){
        let title = document.querySelector("#recipeName");
        title.innerText = this.recipeData[this.recipeDataIndex].name;
    
        let body = document.querySelector("#recipes tbody");
        for(let ing of this.recipeData[this.recipeDataIndex].ingredients){
            let row = document.createElement("tr");
            body.appendChild(row);
    
            let ingTd = document.createElement("td");
            row.appendChild(ingTd);
            let ingName = document.createElement("select");
            for(let ingredient of data.ingredients){
                let newOption = document.createElement("option");
                newOption.innerText = ingredient.name;
                newOption.value = ingredient.id;
                if(ingredient.id === ing.id){
                    newOption.selected = "selected";
                }
                ingName.appendChild(newOption);
            }
            ingTd.appendChild(ingName);
    
            let quantTd = document.createElement("td");
            row.appendChild(quantTd);
            let ingQuant = document.createElement("input");
            ingQuant.type = "number";
            ingQuant.step = "0.01";
            ingQuant.value = ing.quantity;
            ingQuant.onblur = ()=>{checkValid("quantity", ingQuant)};
            quantTd.appendChild(ingQuant);
        }
    
        let nextButton = document.querySelector("#next");
        if(this.recipeDataIndex === this.recipeData.length - 1){
            nextButton.innerText = "Finish";
            nextButton.onclick = ()=>{this.submitAll()};
        }else{
            nextButton.innerText = "Next Recipe";
            nextButton.onclick = ()=>{this.changeRecipe(1)};
        }
    
        let previousButton = document.querySelector("#previous");
        if(this.recipeDataIndex === 0){
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
        let body = document.querySelector("#recipes tbody");
        this.recipeData[this.recipeDataIndex].ingredients = [];
        let isValid = true;
    
        for(let row of body.children){
            newIngredient ={
                id: row.children[0].children[0].value,
                quantity: row.children[1].children[0].value
            };

            this.recipeData[this.recipeDataIndex].ingredients.push(newIngredient);
            if(!validator.ingredient.quantity(newIngredient.quantity)){
                isValid = false;
                break;
            }
        }

        if(isValid){
            while(body.children.length > 0){
                body.removeChild(body.firstChild);
            }

            this.recipeDataIndex += num;
            this.showRecipe();
        }
    },

    //Add all recipes to data variable
    //Creates a form and submits data
    submitAll: function(){
        this.recipeData[this.recipeDataIndex].ingredients = [];
        let body = document.querySelector("#recipes tbody");
        data.recipes = [];
        let isValid = true;

        for(let row of body.children){
            newIngredient ={
                id: row.children[0].children[0].value,
                quantity: row.children[1].children[0].value
            };
            
            this.recipeData[this.recipeDataIndex].ingredients.push(newIngredient);
            if(!validator.ingredient.quantity(newIngredient.quantity)){
                isValid = false;
                break;
            }
        }

        if(isValid){
            for(let recipe of this.recipeData){
                let newRecipe = {
                    posId: recipe.id,
                    name: recipe.name,
                    ingredients: []
                };

                for(let ingredient of recipe.ingredients){
                    newRecipe.ingredients.push({
                        ingredient: ingredient.id,
                        quantity: ingredient.quantity
                    });
                }
                data.recipes.push(newRecipe);
            }
            
            let form = document.createElement("form");
            form.method = "post";
            form.action = "/merchant/create"
            
            let dataInput = document.createElement("input");
            dataInput.type = "hidden";
            dataInput.name = "data";
            dataInput.value = JSON.stringify(data);
        
            form.appendChild(dataInput);
            document.body.appendChild(form);
            form.submit();
        }
    },

    //Creates a new, empty row in table to input data
    addRecipeIngredientField: function(){
        let body = document.querySelector("#recipes tbody");
    
        let row = document.createElement("tr");
        body.appendChild(row);
    
        let ingTd = document.createElement("td");
        row.appendChild(ingTd);
        let ingName = document.createElement("select");
        for(let ingredient of data.ingredients){
            let newOption = document.createElement("option");
            newOption.innerText = ingredient.name;
            newOption.value = ingredient.id;
            ingName.appendChild(newOption);
        }
        ingTd.appendChild(ingName);
    
        let quantTd = document.createElement("td");
        row.appendChild(quantTd);
        let ingQuant = document.createElement("input");
        ingQuant.type = "number";
        ingQuant.step = "0.01";
        ingQuant.min = "0";
        ingQuant.onblur = ()=>{checkValid("quantity", ingQuant)};
        quantTd.appendChild(ingQuant);
    
        let removeTd = document.createElement("td");
        row.appendChild(removeTd);
        let removeButton = document.createElement("button");
        removeButton.innerText = "-";
        removeButton.onclick = ()=>{row.parentNode.removeChild(row)};
        removeTd.appendChild(removeButton);
    }
}