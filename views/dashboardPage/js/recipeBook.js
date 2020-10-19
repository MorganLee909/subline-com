let recipeBook = {
    isPopulated: false,
    recipeDivList: [],

    display: function(Recipe){
        if(!this.isPopulated){
            this.populateRecipes();

            if(merchant.pos !== "none"){
                document.getElementById("posUpdateRecipe").onclick = ()=>{this.posUpdate(Recipe)};
            }
            document.getElementById("recipeSearch").oninput = ()=>{this.search()};
            document.getElementById("recipeClearButton").onclick = ()=>{this.clearSorting()};

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
            recipeDiv.onclick = ()=>{controller.openSidebar("recipeDetails", merchant.recipes[i])};
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
    },

    posUpdate: function(Recipe){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";
        let url = `/recipe/update/${merchant.pos}`;

        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    for(let i = 0; i < response.new.length; i++){
                        const recipe = new Recipe(
                            response.new[i]._id,
                            response.new[i].name,
                            response.new[i].price,
                            merchant,
                            []
                        );

                        merchant.addRecipe(recipe);
                    }

                    for(let i = 0; i < response.removed.length; i++){
                        for(let j = 0; j < merchant.recipes.length; j++){
                            if(merchant.recipes[j].id === response.removed[i]._id){
                                merchant.removeRecipe(merchant.recipes[j]);
                                break;
                            }
                        }
                    }

                    this.display();
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG.  PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = recipeBook;