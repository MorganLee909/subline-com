module.exports = {
    unused: [],

    display: function(recipe){
        document.getElementById("sidebarDiv").classList.add("sidebarWide");
        document.getElementById("editRecipeTitle").innerText = recipe.name;
        document.getElementById("editRecipeSearch").oninput = ()=>{this.search()};
        document.getElementById("editRecipeSubmit").onclick = ()=>{this.submit()};
        let used = document.getElementById("editRecipeUsed");
        let template = document.getElementById("editRecipeInputItem").content.children[0];
        let tempList = [];

        for(let i = 0; i < recipe.ingredients.length; i++){
            tempList.push(recipe.ingredients[i].ingredient.id);

            let ingredient = template.cloneNode(true);
            ingredient.ingredient = recipe.ingredients[i].ingredient;
            ingredient.children[0].children[0].innerText = recipe.ingredients[i].ingredient.name;
            ingredient.children[0].children[1].onclick = ()=>{this.removeIngredient(ingredient)};
            ingredient.children[1].children[0].value = recipe.ingredients[i].quantity;
            ingredient.children[1].children[1].value = recipe.ingredients[i].unit;
            used.appendChild(ingredient);
        }

        this.unused = [];
        for(let i = 0; i < merchant.inventory.length; i++){
            if(tempList.includes(merchant.inventory[i].ingredient.id)) continue;
            this.unused.push(merchant.inventory[i].ingredient);
        }

        this.displayUnused(this.unused);
    },

    displayUnused: function(items){
        let container = document.getElementById("editRecipeUnused");
        items.sort((a, b) => (a.name > b.name) ? 1 : -1);

        while(container.children.length > 0){
            container.removeChild(container.firstChild);
        }

        for(let i = 0; i < items.length; i++){
            let button = document.createElement("button");
            button.innerText = items[i].name;
            button.classList.add("choosable");
            button.classList.add("selection");
            button.ingredient = items[i];
            button.onclick = ()=>{this.addIngredient(button)};
            container.appendChild(button);
        }
    },

    addIngredient: function(ingredient){
        for(let i = 0; i < this.unused.length; i++){
            if(this.unused[i] === ingredient.ingredient){
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
        newItem.children[0].children[1].onclick = ()=>{this.removeIngredient(newItem)};
        used.appendChild(newItem);
    },

    removeIngredient: function(ingredient){
        let used = document.getElementById("editRecipeUsed");

        this.unused.push(ingredient.ingredient);

        used.removeChild(ingredient);
        this.displayUnused(this.unused);
    },

    search: function(){
        console.log("searching");
        let text = document.getElementById("editRecipeSearch").value;
        let newList = [];

        for(let i = 0; i < this.unused.length; i++){
            let name = this.unused[i].name.toLowerCase();
            if(name.includes(text) === true){
                newList.push(this.unused[i]);
            }
        }

        this.displayUnused(newList);
    },

    submit: function(){
    }
}