window.recipeBookStrandObj = {
    isPopulated: false,

    display: function(){
        if(!this.isPopulated){
            this.populateRecipes();

            this.isPopulated = true;
        }
    },

    populateRecipes: function(){
        let recipeList = document.querySelector("#recipeList");

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

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
        }
    },

    displayRecipe: function(recipe){
        openSidebar(document.querySelector("#recipeDetails"));

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
    },

    displayAddRecipe: function(){
        openSidebar(document.querySelector("#addRecipe"));

        let ingredientsSelect = document.querySelector("#recipeInputIngredients select");
        let categories = categorizeIngredients(merchant.inventory);
        for(let category of categories){
            let optgroup = document.createElement("optgroup");
            optgroup.label = category.name;
            ingredientsSelect.appendChild(optgroup);

            for(let ingredient of category.ingredients){
                let option = document.createElement("option");
                option.value = ingredient.id;
                option.innerText = ingredient.name;
                optgroup.appendChild(option);
            }
        }
    },

    //Updates the number of ingredient inputs displayed for new recipes
    changeRecipeCount: function(){
        let newCount = document.querySelector("#ingredientCount").value;
        let ingredientsDiv = document.querySelector("#recipeInputIngredients");
        let oldCount = ingredientsDiv.children.length;

        if(newCount > oldCount){
            let newDivs = newCount - oldCount;

            for(let i = 0; i < newDivs; i++){
                let newNode = ingredientsDiv.children[0].cloneNode(true);
                newNode.children[2].children[0].value = "";

                ingredientsDiv.appendChild(newNode);
            }

            for(let i = 0; i < newCount; i++){
                ingredientsDiv.children[i].children[0].innerText = `Ingredient ${i + 1}`;
            }
        }else if(newCount < oldCount){
            let newDivs = oldCount - newCount;

            for(let i = 0; i < newDivs; i++){
                ingredientsDiv.removeChild(ingredientsDiv.children[ingredientsDiv.children.length-1]);
            }
        }
    },

    submitNewRecipe: function(){
        let newRecipe = {
            name: document.querySelector("#newRecipeName").value,
            price: document.querySelector("#newRecipePrice").value,
            ingredients: []
        }

        let inputs = document.querySelectorAll("#recipeInputIngredients > div");
        for(let input of inputs){
            newRecipe.ingredients.push({
                ingredient: input.children[1].children[0].value,
                quantity: input.children[2].children[0].value
            });
        }

        if(!validator.recipe(newRecipe)){
            return;
        }

        fetch("/recipe/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(newRecipe)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    newRecipe._id = response._id;
                    newRecipe.price = Math.round(newRecipe.price * 100);
                    for(let i = 0; i < newRecipe.ingredients.length; i++){
                        newRecipe.ingredients[i].quantity = parseFloat(newRecipe.ingredients[i].quantity);
                    }
                    updateRecipes(newRecipe);
                    banner.createNotification("New recipe successfully created");
                }
            })
            .catch((err)=>{
                banner.createError("Refresh page to update data");
            });
    }
}