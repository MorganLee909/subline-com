let controller = {
    recipesStrand: document.querySelector("#recipesStrand"),
    singleRecipeStrand: document.querySelector("#singleRecipeStrand"),

    clearScreen: function(){
        this.recipesStrand.style.display = "none";
        this.singleRecipeStrand.style.display = "none";
    }
}

recipesObj.display();