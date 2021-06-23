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
            ingredient.ingredient = recipe.ingredients[i].ingredient;
            ingredient.children[0].children[0].innerText = recipe.ingredients[i].ingredient.name;
            ingredient.children[0].children[1].onclick = ()=>{this.removeIngredient(recipe.ingredients[i])};
            ingredient.children[1].children[0].value = recipe.ingredients[i].quantity;
            ingredient.children[1].children[1].value = recipe.ingredients[i].unit;
            used.appendChild(ingredient);
        }

        for(let i = 0; i < merchant.inventory.length; i++){
            if(tempList.includes(merchant.inventory[i].ingredient.id)) continue;

            let button = document.createElement("button");
            button.innerText = merchant.inventory[i].ingredient.name;
            button.classList.add("choosable");
            button.classList.add("selection");
            button.ingredient = merchant.inventory[i].ingredient;
            button.onclick = ()=>{this.addIngredient(button)};
            this.unused.push(button);
            unused.appendChild(button);
        }
    },

    addIngredient: function(ingredient){
        for(let i = 0; i < this.unused.length; i++){
            if(this.unused[i] === ingredient){
                this.unused.splice(i, 1);
                break;
            }
        }

        let unused = document.getElementById("editRecipeUnused");
        unused.removeChild(ingredient);
        let used = document.getElementById("editRecipeUsed");
        
        let newItem = document.getElementById("editRecipeInputItem").content.children[0].cloneNode(true);
        newItem.ingredient = ingredient.ingredient;
        newItem.children[0].children[0].innerText = ingredient.ingredient.name;
        newItem.children[0].children[1].onclick = ()=>{this.removeIngredient(ingredient.ingredient)};
        used.appendChild(newItem);
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