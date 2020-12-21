let newRecipe = {
    display: function(Recipe){
        document.getElementById("newRecipeName").value = "";
        document.getElementById("newRecipePrice").value = "";
        document.getElementById("ingredientCount").value = 1;

        let categories = merchant.categorizeIngredients();

        let ingredientsSelect = document.getElementById("recipeInputIngredients");
        while(ingredientsSelect.children.length > 0){
            ingredientsSelect.removeChild(ingredientsSelect.firstChild);
        }

        this.changeIngredientCount(categories);

        document.getElementById("ingredientCount").onchange = ()=>{this.changeIngredientCount(categories)};
        document.getElementById("submitNewRecipe").onclick = ()=>{this.submit(Recipe)};
        document.getElementById("recipeFileUpload").onclick = ()=>{controller.openModal("recipeSpreadsheet")};
    },

    //Updates the number of ingredient inputs displayed for new recipes
    changeIngredientCount: function(categories){
        let newCount = document.getElementById("ingredientCount").value;
        let ingredientsDiv = document.getElementById("recipeInputIngredients");
        let template = document.getElementById("recipeInputIngredient").content.children[0];
        let oldCount = ingredientsDiv.children.length;

        if(newCount > oldCount){
            let newDivs = newCount - oldCount;

            for(let i = 0; i < newDivs; i++){
                let newNode = template.cloneNode(true);
                newNode.children[0].innnerText = `INGREDIENT ${i + oldCount}`;
                newNode.children[2].children[0].value = 0;

                for(let j = 0; j < categories.length; j++){
                    let optgroup = document.createElement("optgroup");
                    optgroup.label = categories[j].name;

                    for(let k = 0; k < categories[j].ingredients.length; k++){
                        let option = document.createElement("option");
                        option.innerText = categories[j].ingredients[k].ingredient.getNameAndUnit();
                        option.ingredient = categories[j].ingredients[k];
                        optgroup.appendChild(option);
                    }

                    newNode.children[1].children[0].appendChild(optgroup);
                }

                ingredientsDiv.appendChild(newNode);
            }

            for(let i = 0; i < newCount; i++){
                ingredientsDiv.children[i].children[0].innerText = `INGREDIENT ${i + 1}`;
            }
        }else if(newCount < oldCount){
            let newDivs = oldCount - newCount;

            for(let i = 0; i < newDivs; i++){
                ingredientsDiv.removeChild(ingredientsDiv.children[ingredientsDiv.children.length-1]);
            }
        }
    },

    submit: function(Recipe){
        let newRecipe = {
            name: document.getElementById("newRecipeName").value,
            price: document.getElementById("newRecipePrice").value,
            ingredients: []
        }

        let inputs = document.getElementById("recipeInputIngredients").children;
        for(let i = 0; i < inputs.length; i++){
            let sel = inputs[i].children[1].children[0];
            let ingredient = sel.options[sel.selectedIndex].ingredient;

            let newIngredient = {
                ingredient: ingredient.ingredient.id,
                quantity: ingredient.convertToBase(inputs[i].children[2].children[0].value)
            };

            newRecipe.ingredients.push(newIngredient);
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

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
                    controller.createBanner(response, "error");
                }else{
                    let ingredients = [];
                    for(let i = 0; i < response.ingredients.length; i++){
                        for(let j = 0; j < merchant.ingredients.length; j++){
                            if(merchant.ingredients[j].ingredient.id === response.ingredients[i].ingredient){
                                ingredients.push({
                                    ingredient: merchant.ingredients[j].ingredient.id,
                                    quantity: response.ingredients[i].quantity
                                });

                                break;
                            }
                        }
                    }

                    merchant.addRecipe(
                        response._id,
                        response.name,
                        response.price,
                        ingredients
                    );

                    controller.createBanner("RECIPE CREATED", "success");
                    controller.openStrand("recipeBook");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    submitSpreadsheet: function(){
        event.preventDefault();
        controller.closeModal();

        const file = document.getElementById("spreadsheetInput").files[0];
        let data = new FormData();
        data.append("recipes", file);

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/recipes/create/spreadsheet", {
            method: "post",
            body: data
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    for(let i = 0; i < response.length; i++){
                        merchant.addRecipe(
                            response[i]._id,
                            response[i].name,
                            response[i].price,
                            response[i].ingredients
                        );
                    }

                    controller.createBanner("ALL INGREDIENTS SUCCESSFULLY CREATED", "success");
                    controller.openStrand("recipeBook");
                }
            })
            .catch((err)=>{
                controller.createBanner("UNABLE TO DISPLAY NEW RECIPES.  PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = newRecipe;