let editRecipe = {
    display: function(recipe){
        let nameInput = document.getElementById("editRecipeName");
        if(merchant.pos === "none"){
            nameInput.value = recipe.name;
        }else{
            document.getElementById("editRecipeNoName").innertext = recipe.name;
            nameInput.parentNode.style.display = "none";
        }

        document.getElementById("editRecipeCategory").value = recipe.category;

        //Populate ingredients
        let ingredientList = document.getElementById("editRecipeIngList");

        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.getElementById("editRecipeIng").content.children[0];
        for(let i = 0; i < recipe.ingredients.length; i++){
            let ingredientDiv = template.cloneNode(true);
            ingredientDiv.children[0].onclick = ()=>{ingredientDiv.parentNode.removeChild(ingredientDiv)};
            ingredientDiv.children[1].innerText = recipe.ingredients[i].ingredient.getNameAndUnit();
            ingredientDiv.children[2].style.display = "none";
            ingredientDiv.children[3].value = recipe.ingredients[i].quantity;
            ingredientDiv.ingredient = recipe.ingredients[i];
            
            ingredientList.appendChild(ingredientDiv);
        }

        document.getElementById("addRecIng").onclick = ()=>{this.newIngredient()};
        document.getElementById("editRecipePrice").value = recipe.price;
        document.getElementById("editRecipeSubmit").onclick = ()=>{this.submit(recipe)};
        document.getElementById("editRecipeCancel").onclick = ()=>{controller.openSidebar("recipeDetails", recipe)};
    },

    newIngredient: function(){
        let ingredientList = document.getElementById("editRecipeIngList");

        let ingredientDiv = document.getElementById("editRecipeIng").content.children[0].cloneNode(true);
        ingredientDiv.children[0].onclick = ()=>{ingredientDiv.parentNode.removeChild(ingredientDiv)};
        ingredientDiv.children[1].style.display = "none";
        ingredientDiv.children[3].value = "0.00";

        //Populate selector
        let categories = merchant.categorizeIngredients();
        for(let i = 0; i < categories.length; i++){
            let group = document.createElement("optgroup");
            group.label = categories[i].name;

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let option = document.createElement("option");
                option.innerText = categories[i].ingredients[j].ingredient.getNameAndUnit();
                option.ingredient = categories[i].ingredients[j];
                group.appendChild(option);
            }
            
            ingredientDiv.children[2].appendChild(group);
        }

        ingredientList.appendChild(ingredientDiv);
    },

    submit: function(recipe){
        let data = {
            id: recipe.id,
            name: recipe.name,
            price: document.getElementById("editRecipePrice").value * 100,
            category: document.getElementById("editRecipeCategory").value,
            ingredients: []
        }

        if(merchant.pos === "none"){
            data.name = document.getElementById("editRecipeName").value;
        }

        let ingredients = document.getElementById("editRecipeIngList").children;
        for(let i = 0; i < ingredients.length; i++){
            const quantity = parseFloat(ingredients[i].children[3].value);
            let newIngredient = {};
            let ingredient = {};

            if(ingredients[i].children[1].style.display === "none"){
                let selector = ingredients[i].children[2];
                ingredient = selector.options[selector.selectedIndex].ingredient;

                newIngredient = {
                    ingredient: ingredient.ingredient.id,
                    quantity: controller.baseUnit(quantity, ingredient.ingredient.unit)
                };
            }else{
                ingredient = ingredients[i].ingredient;

                newIngredient = {
                    ingredient: ingredient.ingredient.id,
                    quantity: controller.baseUnit(quantity, ingredient.ingredient.unit)
                };
            }

            data.ingredients.push(newIngredient);
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/recipe/update", {
            method: "put",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    merchant.removeRecipe(recipe)
                    merchant.addRecipes([response]);
                    state.updateRecipes();
                    controller.openStrand("recipeBook");
                    controller.createBanner("RECIPE UPDATED", "success");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = editRecipe;