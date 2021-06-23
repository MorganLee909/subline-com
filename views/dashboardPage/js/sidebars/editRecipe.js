module.exports = {
    unused: [],

    display: function(recipe){
        document.getElementById("sidebarDiv").classList.add("sidebarWide");
        document.getElementById("editRecipeTitle").innerText = recipe.name;
        document.getElementById("editRecipeSearch").onchange = ()=>{this.search()};
        document.getElementById("editRecipeSubmit").onclick = ()=>{this.submit()};
        let used = document.getElementById("editRecipeUsed");
        let unused = document.getElementById("editRecipeUnused");
        let template = document.getElementById("editRecipeInputItem").content.children[0];
        let tempList = [];

        for(let i = 0; i < recipe.ingredients.length; i++){
            tempList.push(recipe.ingredients[i].ingredient.id);

            let ingredient = template.cloneNode(true);
            ingredient.children[0].children[0].innerText = recipe.ingredients[i].ingredient.name;
            ingredient.children[0].children[1].onclick = ()=>{this.removeIngredient(recipe.ingredients[i])};
            ingredient.children[1].children[0].placeholder = "QUANTITY";
            used.appendChild(ingredient);
        }

        for(let i = 0; i < merchant.inventory.length; i++){
            if(tempList.includes(merchant.inventory[i].ingredient.id)) continue;

            let button = document.createElement("button");
            button.innerText = merchant.inventory[i].ingredient.name;
            button.classList.add("choosable");
            button.classList.add("selection");
            button.onclick = ()=>{this.addIngredient(merchant.inventory[i].ingredient)};
            this.unused.push(button);
            unused.appendChild(button);
        }
    },

    addIngredient: function(ingredient){
        console.log(ingredient);
    },

    removeIngredient: function(ingredient){
        console.log(ingredient);
    },

    search: function(){
        console.log("searching");
    },

    submit: function(){
        console.log("submitting");
    }
}