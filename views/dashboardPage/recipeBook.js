window.recipeBookStrandObj = {
    isPopulated: false,
    recipeDivList: [],

    display: function(){
        if(!this.isPopulated){
            this.populateRecipes();

            this.isPopulated = true;
        }
    },

    populateRecipes: function(){
        let recipeList = document.querySelector("#recipeList");

        this.recipeDivList = [];
        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let recipe of merchant.recipes){
            let recipeDiv = document.createElement("div");
            recipeDiv.classList = "rowItem";
            recipeDiv.onclick = ()=>{recipeDetailsComp.display(recipe)};
            recipeDiv._name = recipe.name;
            recipeList.appendChild(recipeDiv);

            let recipeName = document.createElement("p");
            recipeName.innerText = recipe.name;
            recipeDiv.appendChild(recipeName);

            let recipePrice = document.createElement("p");
            recipePrice.innerText = `$${(recipe.price / 100).toFixed(2)}`;
            recipeDiv.appendChild(recipePrice);

            this.recipeDivList.push(recipeDiv);
        }
    },

    search: function(){
        let input = document.getElementById("recipeSearch").value.toLowerCase();
        let recipeList = document.getElementById("recipeList");
        let clearButton = document.getElementById("recipeClearButton");

        let matchingRecipes = [];
        for(let i = 0; i < this.recipeDivList.length; i++){
            if(this.recipeDivList[i]._name.toLowerCase().includes(input)){
                matchingRecipes.push(this.recipeDivList[i]);
            }
        }

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }
        for(let i = 0; i < matchingRecipes.length; i++){
            recipeList.appendChild(matchingRecipes[i]);
        }

        if(input === ""){
            clearButton.style.display = "none";
        }else{
            clearButton.style.display = "inline";
        }
    },

    clearSorting: function(){
        document.getElementById("recipeSearch").value = "";
        this.search();
    }
}