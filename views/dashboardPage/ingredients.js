window.ingredientsStrandObj = {
    isPopulated: false,
    ingredients: [],

    display: function(){
        if(!this.isPopulated){
            this.populateIngredients();

            this.isPopulated = true;
        }
    },

    populateIngredients: function(){
        let categories = categorizeIngredients(merchant.inventory);
        this.ingredients = [];

        let ingredientStrand = document.querySelector("#categoryList");
        while(ingredientStrand.children.length > 0){
            ingredientStrand.removeChild(ingredientStrand.firstChild);
        }
        for(let i = 0; i < categories.length; i++){
            let categoryDiv = document.createElement("div");
            categoryDiv.classList = "categoryDiv"
            ingredientStrand.appendChild(categoryDiv);

            let headerDiv = document.createElement("div");
            categoryDiv.appendChild(headerDiv);
            
            let headerTitle = document.createElement("p");
            headerTitle.innerText = categories[i].name;
            headerDiv.appendChild(headerTitle);

            let ingredientsDiv = document.createElement("div");
            ingredientsDiv.classList = "ingredientsDiv";
            ingredientsDiv.style.display = "none";
            categoryDiv.appendChild(ingredientsDiv);

            let headerButton = document.createElement("button");
            headerButton.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
            headerButton.onclick = ()=>{this.toggleCategory(ingredientsDiv, headerButton)};
            headerDiv.appendChild(headerButton);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let ingredientDiv = document.createElement("div");
                ingredientDiv.classList = "ingredient";
                ingredientDiv.onclick = ()=>{ingredientDetailsComp.display(categories[i].ingredients[j], categories[i])};
                ingredientsDiv.appendChild(ingredientDiv);
                ingredientDiv._name = categories[i].ingredients[j].name.toLowerCase();
                ingredientDiv._unit = categories[i].ingredients[j].unit.toLowerCase();

                let ingredientName = document.createElement("p");
                ingredientName.innerText = categories[i].ingredients[j].name;
                ingredientDiv.appendChild(ingredientName);

                let spacer = document.createElement("hr");
                spacer.classList = "ingredientSpacer";
                ingredientDiv.appendChild(spacer);

                let ingredientData = document.createElement("p");
                ingredientData.innerText = `${categories[i].ingredients[j].quantity} ${categories[i].ingredients[j].unit}`;
                ingredientDiv.appendChild(ingredientData);

                this.ingredients.push(ingredientDiv);
            }
        }
    },

    displayIngredientsOnly: function(ingredients){
        let ingredientDiv = document.querySelector("#categoryList");

        while(ingredientDiv.children.length > 0){
            ingredientDiv.removeChild(ingredientDiv.firstChild);
        }
        for(let i = 0; i < ingredients.length; i++){
            ingredientDiv.appendChild(ingredients[i]);
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
    },

    search: function(){
        let input = document.querySelector("#ingredientSearch").value.toLowerCase();
        if(input === ""){
            this.populateIngredients();
            return;
        }

        let matchingIngredients = [];
        for(let i = 0; i < this.ingredients.length; i++){
            if(this.ingredients[i]._name.includes(input)){
                matchingIngredients.push(this.ingredients[i]);
            }
        }

        this.displayIngredientsOnly(matchingIngredients);
    }
}