window.ingredientsStrandObj = {
    isPopulated: false,

    display: function(){
        if(!this.isPopulated){
            let categories = this.categorizeIngredients();

            let ingredientsStrand = document.querySelector("#ingredientsStrand");
            for(let category of categories){
                let categoryDiv = document.createElement("div");
                categoryDiv.classList = "categoryDiv"
                ingredientsStrand.appendChild(categoryDiv);

                let headerDiv = document.createElement("div");
                categoryDiv.appendChild(headerDiv);
                
                let headerTitle = document.createElement("p");
                headerTitle.innerText = category.name;
                headerDiv.appendChild(headerTitle);

                let ingredientsDiv = document.createElement("div");
                ingredientsDiv.classList = "ingredientsDiv";
                ingredientsDiv.style.display = "none";
                categoryDiv.appendChild(ingredientsDiv);

                let headerButton = document.createElement("button");
                headerButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
                headerButton.onclick = ()=>{this.toggleCategory(ingredientsDiv, headerButton)};
                headerDiv.appendChild(headerButton);

                for(let ingredient of category.ingredients){
                    let ingredientDiv = document.createElement("div");
                    ingredientDiv.classList = "ingredient";
                    ingredientsDiv.appendChild(ingredientDiv);

                    let ingredientName = document.createElement("p");
                    ingredientName.innerText = ingredient.name;
                    ingredientDiv.appendChild(ingredientName);

                    let spacer = document.createElement("p");
                    spacer.innerText = "-".repeat(25);
                    ingredientDiv.appendChild(spacer);

                    let ingredientData = document.createElement("p");
                    ingredientData.innerText = `${ingredient.quantity} ${ingredient.unit}`;
                    ingredientDiv.appendChild(ingredientData);
                }

                
            }

            this.isPopulated = true;
        }
    },

    categorizeIngredients: function(){
        let ingredientsByCategory = [];

        for(let item of merchant.inventory){
            let categoryExists = false;
            for(let category of ingredientsByCategory){
                if(item.ingredient.category === category.name){
                    category.ingredients.push({
                        id: item.ingredient._id,
                        name: item.ingredient.name,
                        quantity: item.quantity,
                        unit: item.ingredient.unit
                    });

                    categoryExists = true;
                    break;
                }
            }

            if(!categoryExists){
                ingredientsByCategory.push({
                    name: item.ingredient.category,
                    ingredients: [{
                        id: item.ingredient._id,
                        name: item.ingredient.name,
                        quantity: item.quantity,
                        unit: item.ingredient.unit
                    }]
                });
            }
        }

        return ingredientsByCategory;
    },

    toggleCategory: function(div, button){
        if(div.style.display === "none"){
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
            div.style.display = "flex";
        }else if(div.style.display === "flex"){
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
            div.style.display = "none";
        }
    }
}