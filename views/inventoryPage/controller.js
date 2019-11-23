let controller = {
    inventoryStrand: document.querySelector("#inventoryStrand"),
    recipeStrand: document.querySelector("#recipeStrand"),
    addIngredientStrand: document.querySelector("#addIngredientStrand"),
    enterTransactionsStrand: document.querySelector("#enterTransactionsStrand"),

    clearScreen: function(){
        this.inventoryStrand.style.display = "none";
        this.recipeStrand.style.display = "none";
        this.addIngredientStrand.style.display = "none";
        this.enterTransactionsStrand.style.display = "none";
    }
}

inventoryObj.display();