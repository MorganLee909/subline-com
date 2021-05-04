let newRecipe = {
    unchosen: [],

    display: function(){
        document.getElementById("sidebarDiv").classList.add("sidebarWide");

        document.getElementById("submitNewRecipe").onclick = ()=>{this.submit()};

        for(let i = 0; i < merchant.ingredients.length; i++){
            this.unchosen.push(merchant.ingredients[i].ingredient);
        }

        this.populateChoices();
    },

    populateChoices: function(){
        this.unchosen.sort((a, b) => (a.name > b.name) ? 1 : -1);

        let list = document.getElementById("recipeChoices");
        while(list.children.length > 0){
            list.removeChild(list.firstChild);
        }

        for(let i = 0; i < this.unchosen.length; i++){
            let ingredient = document.createElement("button");
            ingredient.innerText = this.unchosen[i].name;
            ingredient.classList.add("choosable");
            ingredient.onclick = ()=>{
                this.add(this.unchosen[i]);
                this.unchosen.splice(i, 1);
                this.populateChoices();
            };
            list.appendChild(ingredient);
        }
    },

    add: function(ingredient){
        let element = document.getElementById("newRecipeChosenIngredient").content.children[0].cloneNode(true);
        element.children[0].innerText = ingredient.name;
        element.children[1].children[0].placeholder = `QUANTITY (${ingredient.unit.toUpperCase()})`;
        element.children[1].children[1].onclick = ()=>{
            this.unchosen.push(ingredient);
            element.parentElement.removeChild(element);
            this.populateChoices();
        };
        element.ingredient = ingredient;
        document.getElementById("newRecipeChosenList").appendChild(element);
    },

    submit: function(){
        let data = {
            name: document.getElementById("newRecipeName").value,
            price: document.getElementById("newRecipePrice").value,
            ingredients: []
        };

        let ingredients = document.getElementById("newRecipeChosenList").children;
        for(let i = 0; i < ingredients.length; i++){
            data.ingredients.push({
                ingredient: ingredients[i].ingredient.id,
                quantity: ingredients[i].children[1].children[0].value
            })
        }

        console.log(data);
    }
};

module.exports = newRecipe;