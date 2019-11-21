let controller = {
    inventoryStrand: document.querySelector("#inventoryStrand"),
    recipeStrand: document.querySelector("#recipeStrand"),
    addIngredientStrand: document.querySelector("#addIngredientStrand"),

    clearScreen: function(){
        this.inventoryStrand.style.display = "none";
        this.recipeStrand.style.display = "none";
        this.addIngredientStrand.style.display = "none";
    }
}

inventoryObj.display();