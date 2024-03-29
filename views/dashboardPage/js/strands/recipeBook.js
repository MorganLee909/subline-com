const Recipe = require("../classes/Recipe.js");

let recipeBook = {
    isPopulated: false,
    recipeDivList: [],

    display: function(){
        if(!this.isPopulated){
            this.populateRecipes();

            let button = document.getElementById("recipeUpdate");
            switch(merchant.pos){
                case "square":
                    button.innerText = "UPDATE";
                    button.onclick = ()=>{this.posUpdate()};
                    break;
                case "none":
                    button.innerText = "NEW";
                    button.onclick = ()=>{controller.openSidebar("addRecipe")};
                    break;
            }

            document.getElementById("hiddenRecipesCheckbox").onclick = ()=>{this.populateRecipes()};
                            
            document.getElementById("recipeSearch").oninput = ()=>{this.search()};

            this.populateRecipes();

            this.isPopulated = true;
        }
    },

    populateRecipes: function(){
        let recipeList = document.getElementById("recipeList");
        let template = document.getElementById("recipe").content.children[0];
        let hiddenCheck = document.getElementById("hiddenRecipesCheckbox");

        this.recipeDivList = [];
        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            if(merchant.recipes[i].hidden === true && hiddenCheck.checked === false) continue;
            let recipeDiv = template.cloneNode(true);
            recipeDiv.onclick = ()=>{
                controller.openSidebar("recipeDetails", merchant.recipes[i]);
                recipeDiv.classList.add("active");
            }
            recipeDiv._name = merchant.recipes[i].name;
            recipeList.appendChild(recipeDiv);

            recipeDiv.children[0].innerText = merchant.recipes[i].name;
            recipeDiv.children[1].innerText = `$${merchant.recipes[i].price.toFixed(2)}`;

            this.recipeDivList.push(recipeDiv);
        }
    },

    search: function(){
        let input = document.getElementById("recipeSearch").value.toLowerCase();
        let recipeList = document.getElementById("recipeList");

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
    },

    posUpdate: function(){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";
        let url = `/recipes/update/${merchant.pos}`;

        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    merchant.addRecipes(response.new);

                    for(let i = 0; i < response.removed.length; i++){
                        for(let j = 0; j < merchant.recipes.length; j++){
                            if(merchant.recipes[j].id === response.removed[i]._id){
                                merchant.removeRecipe(merchant.recipes[j]);
                                break;
                            }
                        }
                    }

                    state.updateRecipes();
                    controller.createBanner("RECIPES SUCCESSFULLY UPDATED", "success");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = recipeBook;