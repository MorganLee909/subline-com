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
        let ingredientStrand = document.querySelector("#categoryList");
        let categoryTemplate = document.querySelector("#categoryDiv").content.children[0];
        let ingredientTemplate = document.querySelector("#ingredient").content.children[0];
        this.ingredients = [];

        while(ingredientStrand.children.length > 0){
            ingredientStrand.removeChild(ingredientStrand.firstChild);
        }

        for(let i = 0; i < categories.length; i++){
            let categoryDiv = categoryTemplate.cloneNode(true);
            categoryDiv.children[0].children[0].innerText = categories[i].name;
            categoryDiv.children[0].children[1].onclick = ()=>{this.toggleCategory(categoryDiv.children[1], categoryDiv.children[0].children[1])};
            categoryDiv.children[1].style.display = "none";
            ingredientStrand.appendChild(categoryDiv);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let ingredient = categories[i].ingredients[j];
                let ingredientDiv = ingredientTemplate.cloneNode(true);

                ingredientDiv.children[0].innerText = ingredient.name;
                ingredientDiv.children[2].innerText = `${ingredient.quantity} ${ingredient.unit}`;
                ingredientDiv.onclick = ()=>{ingredientDetailsComp.display(ingredient, categories[i])};
                ingredientDiv._name = ingredient.name.toLowerCase();
                ingredientDiv._unit = ingredient.unit.toLowerCase();

                categoryDiv.children[1].appendChild(ingredientDiv);
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
    },

    sort: function(sortType){
        if(sortType === ""){
            return;
        }

        document.querySelector("#ingredientSearch").value = "";

        if(sortType === "category"){
            this.populateIngredients();
            return;
        }

        let sortedIngredients = this.ingredients.slice().sort((a, b)=> (a[sortType] > b[sortType]) ? 1 : -1);
        this.displayIngredientsOnly(sortedIngredients);
    }
}