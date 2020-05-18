window.ingredientsStrandObj = {
    isPopulated: false,
    addIngredientsDiv: [],

    display: function(){
        if(!this.isPopulated){
            this.populateIngredients();

            this.isPopulated = true;
        }
    },

    populateIngredients: function(){
        let categories = categorizeIngredients(merchant.inventory);

        let ingredientStrand = document.querySelector("#categoryList");
        while(ingredientStrand.children.length > 0){
            ingredientStrand.removeChild(ingredientStrand.firstChild);
        }
        for(let category of categories){
            let categoryDiv = document.createElement("div");
            categoryDiv.classList = "categoryDiv"
            ingredientStrand.appendChild(categoryDiv);

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
            headerButton.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
            headerButton.onclick = ()=>{this.toggleCategory(ingredientsDiv, headerButton)};
            headerDiv.appendChild(headerButton);

            for(let ingredient of category.ingredients){
                let ingredientDiv = document.createElement("div");
                ingredientDiv.classList = "ingredient";
                ingredientDiv.onclick = ()=>{ingredientDetailsComp.display(ingredient, category)};
                ingredientsDiv.appendChild(ingredientDiv);

                let ingredientName = document.createElement("p");
                ingredientName.innerText = ingredient.name;
                ingredientDiv.appendChild(ingredientName);

                let spacer = document.createElement("hr");
                spacer.classList = "ingredientSpacer";
                ingredientDiv.appendChild(spacer);

                let ingredientData = document.createElement("p");
                ingredientData.innerText = `${ingredient.quantity} ${ingredient.unit}`;
                ingredientDiv.appendChild(ingredientData);
            }
        }
    },

    //Open or close the list of ingredients for a category
    toggleCategory: function(div, button){
        if(div.style.display === "none"){
            button.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
            div.style.display = "flex";
        }else if(div.style.display === "flex"){
            button.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
            div.style.display = "none";
        }
    }
}