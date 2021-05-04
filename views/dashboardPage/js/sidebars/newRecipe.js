let newRecipe = {
    unchosen: [],

    display: function(){
        document.getElementById("sidebarDiv").classList.add("sidebarWide");

        for(let i = 0; i < merchant.ingredients.length; i++){
            this.unchosen.push(merchant.ingredients[i].ingredient);
        }

        this.populateChoices();
    },

    populateChoices: function(){
        this.unchosen.sort((a, b) => (a.name > b.name) ? 1 : -1);

        let list = document.getElementById("recipeChoicesList");
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
        element.children[0].children[0].innerText = ingredient.name;
        element.children[0].children[1].onclick = ()=>{
            this.unchosen.push(ingredient);
            element.parentElement.removeChild(element);
            this.populateChoices();
        };
        element.children[1].placeholder = `UNIT (${ingredient.unit.toUpperCase()})`;
        document.getElementById("newRecipeChosenList").appendChild(element);
    },
};

module.exports = newRecipe;