let newRecipe = {
    unselected: [],
    selected: [],

    display: function(){
        document.getElementById("sidebarDiv").classList.add("sidebarWide");

        let list = document.getElementById("recipeChoicesList");
        for(let i = 0; i < merchant.recipes.length; i++){
            this.unselected.push(merchant.recipes[i]);

            let recipe = document.createElement("button");
            recipe.innerText = merchant.recipes[i];
            recipe.classList.add("choosable");
            recipe.onclick = ()=>{this.add(merchant.recipes[i], recipe)};
            list.appendChild(recipe);
        }
    },

    add: function(recipe, element){
        console.log("adding");
    }
};

module.exports = newRecipe;