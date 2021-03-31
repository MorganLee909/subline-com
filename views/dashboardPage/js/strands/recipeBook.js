const Recipe = require("../classes/Recipe.js");

let recipeBook = {
    isPopulated: false,
    recipeDivList: [],

    display: function(){
        if(!this.isPopulated){
            this.populateRecipes();

            if(merchant.pos === "square") document.getElementById("posUpdateRecipe").onclick = ()=>{this.posUpdate()};
            
            document.getElementById("recipeSearch").oninput = ()=>{this.search()};

            this.populateRecipes();

            this.isPopulated = true;
        }
    },

    populateRecipes: function(){
        let recipeList = document.getElementById("recipeList");
        let template = document.getElementById("recipe").content.children[0];

        this.recipeDivList = [];
        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
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
                    let newRecipes = [];
                    for(let i = 0; i < response.new.length; i++){
                        newRecipes.push(new Recipe(
                            response.new[i]._id,
                            response.new[i].name,
                            response.new[i].price,
                            merchant,
                            []
                        ));
                    }

                    merchant.addRecipes(newRecipes);

                    for(let i = 0; i < response.removed.length; i++){
                        for(let j = 0; j < merchant.recipes.length; j++){
                            if(merchant.recipes[j].id === response.removed[i]._id){
                                merchant.removeRecipe(merchant.recipes[j]);
                                break;
                            }
                        }
                    }

                    controller.createBanner("RECIPES SUCCESSFULLY UPDATED", "success");
                    this.display();
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