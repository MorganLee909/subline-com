let ingredientDetails = {
    dailyUse: 0,

    display: function(ingredient){
        document.getElementById("editIngBtn").onclick = ()=>{controller.openSidebar("editIngredient", ingredient)};
        document.getElementById("removeIngBtn").onclick = ()=>{controller.openModal("confirmDeleteIngredient", ingredient)};
        document.getElementById("ingredientDetailsCategory").innerText = ingredient.ingredient.category;
        document.getElementById("ingredientDetailsName").innerText = ingredient.ingredient.name;
        document.getElementById("ingredientStock").innerText = ingredient.getQuantityDisplay();

        //Calculate and display average daily use
        let quantities = [];
        let now = new Date();
        for(let i = 1; i < 31; i++){
            let endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
            let startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i - 1);

            quantities.push(merchant.getSingleIngredientSold(ingredient, startDay, endDay));
        }

        let sum = 0;
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
        }

        let dailyUse = sum / quantities.length;
        const dailyUseDiv = document.getElementById("dailyUse");
        dailyUseDiv.innerText = `${dailyUse.toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;

        let subIngredientList = document.getElementById("subIngredientList");
        let template = document.getElementById("ingredientRecipe").content.children[0];

        while(subIngredientList.children.length > 0){
            subIngredientList.removeChild(subIngredientList.firstChild);
        }

        for(let i = 0; i < ingredient.ingredient.subIngredients.length; i++){
            let subIngredient = ingredient.ingredient.subIngredients[i];
            let button = template.cloneNode(true);
            button.children[0].innerText = subIngredient.ingredient.name;
            button.children[1].innerText = `${subIngredient.quantity} ${subIngredient.ingredient.unit}`;
            button.onclick = ()=>{this.display(merchant.getIngredient(subIngredient.ingredient.id))};
            subIngredientList.appendChild(button);
        }
    },

    remove: function(ingredient){
        for(let i = 0; i < merchant.recipes.length; i++){
            for(let j = 0; j < merchant.recipes[i].ingredients.length; j++){
                if(ingredient.ingredient === merchant.recipes[i].ingredients[j].ingredient){
                    controller.createBanner("MUST REMOVE INGREDIENT FROM ALL RECIPES BEFORE REMOVING FROM INVENTORY", "error");
                    return;
                }
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/ingredients/remove/${ingredient.ingredient.id}`, {
            method: "delete",
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    merchant.removeIngredient(ingredient);
                    state.updateIngredients();
                    
                    controller.openStrand("ingredients");
                    controller.closeModal();
                    controller.createBanner("INGREDIENT REMOVED", "success");
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

module.exports = ingredientDetails;