let transactionFilter = {
    display: function(){
        //Set default dates
        let today = new Date();
        let monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);

        document.getElementById("transFilterDateStart").valueAsDate = monthAgo;
        document.getElementById("transFilterDateEnd").valueAsDate = today;

        //populate recipes
        let recipeList = document.getElementById("transFilterRecipeList");

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let recipe = document.createElement("div");
            recipe.innerText = merchant.recipes[i].name;
            recipe.recipe = merchant.recipes[i];
            recipe.classList.add("choosable");
            recipe.onclick = ()=>{this.toggleActive(recipe)};
            recipeList.appendChild(recipe);
        }

        //Submit button
        document.getElementById("transFilterSubmit").onclick = ()=>{this.submit()};
    },

    toggleActive: function(element){
        if(element.classList.contains("active")){
            element.classList.remove("active");
        }else{
            element.classList.add("active");
        }
    },

    submit: function(){
        
    }
}

module.exports = transactionFilter;