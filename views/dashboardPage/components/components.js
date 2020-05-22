let recipeDetailsComp = {
    recipe: {},

    display: function(recipe){
        this.recipe = recipe;
        openSidebar(document.querySelector("#recipeDetails"));

        document.querySelector("#recipeName").style.display = "block";
        document.querySelector("#recipeNameIn").style.display = "none";
        document.querySelector("#recipeDetails h1").innerText = recipe.name;

        let ingredientList = document.querySelector("#recipeIngredientList");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.querySelector("#recipeIngredient").content.children[0];
        for(let i = 0; i < recipe.ingredients.length; i++){
            ingredientDiv = template.cloneNode(true);

            ingredientDiv.children[0].innerText = recipe.ingredients[i].ingredient.name;
            ingredientDiv.children[2].innerText = `${recipe.ingredients[i].quantity} ${recipe.ingredients[i].ingredient.unit}`;
            ingredientDiv._id = recipe.ingredients[i].ingredient._id;
            ingredientDiv.name = recipe.ingredients[i].ingredient.name;

            ingredientList.appendChild(ingredientDiv);
        }

        document.querySelector("#addRecIng").style.display = "none";

        let price = document.querySelector("#recipePrice");
        price.children[1].style.display = "block";
        price.children[2].style.display = "none";
        price.children[1].innerText = `$${(recipe.price / 100).toFixed(2)}`;

        document.querySelector("#recipeUpdate").style.display = "none";
    },

    edit: function(){
        let ingredientDivs = document.querySelector("#recipeIngredientList");

        let name = document.querySelector("#recipeName");
        let nameIn = document.querySelector("#recipeNameIn");
        name.style.display = "none";
        nameIn.style.display = "block";
        nameIn.placeholder = name.innerText;

        for(let i = 0; i < ingredientDivs.children.length; i++){
            let div = ingredientDivs.children[i];

            div.children[2].innerText = this.recipe.ingredients[i].ingredient.unit;
            div.children[1].style.display = "block";
            div.children[1].placeholder = this.recipe.ingredients[i].quantity;
            div.children[3].style.display = "block";
            div.children[3].onclick = ()=>{div.parentElement.removeChild(div)};
        }

        document.querySelector("#addRecIng").style.display = "flex";

        let price = document.querySelector("#recipePrice");
        price.children[1].style.display = "none";
        price.children[2].style.display = "block";
        price.children[2].placeholder = price.children[1].innerText;

        document.querySelector("#recipeUpdate").style.display = "flex";
    },

    update: function(){
        let updatedRecipe = {
            _id: this.recipe._id,
            name: document.querySelector("#recipeNameIn").value || this.recipe.name,
            price: Math.round((document.querySelector("#recipePrice").children[2].value * 100)) || this.recipe.price,
            ingredients: []
        }

        let divs = document.querySelector("#recipeIngredientList").children;
        for(let i = 0; i < divs.length; i++){
            if(divs[i].name === "new"){
                updatedRecipe.ingredients.push({
                    ingredient: divs[i].children[0].value,
                    quantity: divs[i].children[1].value
                })
            }else{
                updatedRecipe.ingredients.push({
                    ingredient: divs[i]._id,
                    quantity: divs[i].children[1].value || divs[i].children[1].placeholder
                });
            }
        }

        if(validator.recipe(updatedRecipe)){
            fetch("/recipe/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(updatedRecipe)
            })
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        updateRecipes(updatedRecipe);
                        banner.createNotification("Recipe successfully updated");
                    }
                })
                .catch((err)=>{
                    banner.createError("Something went wrong.  Please refresh the page");
                })
        }
    },

    remove: function(){
        fetch(`/merchant/recipes/remove/${this.recipe._id}`, {
            method: "DELETE"
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    updateRecipes(this.recipe, true);
                    banner.createNotification("Recipe removed");
                }
            })
            .catch((err)=>{
                banner.createError("Something went wrong.  Try refreshing the page");
            });
    },

    displayAddIngredient: function(){
        let template = document.querySelector("#addRecIngredient").content.children[0].cloneNode(true);
        template.name = "new";
        document.querySelector("#recipeIngredientList").appendChild(template);

        let categories = categorizeIngredients(merchant.inventory);

        for(let i = 0; i < categories.length; i++){
            let optGroup = document.createElement("optgroup");
            optGroup.label = categories[i].name;
            template.children[0].appendChild(optGroup);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let option = document.createElement("option");
                option.innerText = `${categories[i].ingredients[j].name} (${categories[i].ingredients[j].unit})`;
                option.value = categories[i].ingredients[j].id;
                optGroup.appendChild(option);
            }
        }
    }
}