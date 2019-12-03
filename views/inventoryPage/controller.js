let controller = {
    inventoryStrand: document.querySelector("#inventoryStrand"),
    recipeStrand: document.querySelector("#recipeStrand"),
    addIngredientStrand: document.querySelector("#addIngredientStrand"),
    enterTransactionsStrand: document.querySelector("#enterTransactionsStrand"),

    onStart: function(){
        if(error){
            banner.createError(error);
        }

        inventoryObj.display();
    },

    clearScreen: function(){
        this.inventoryStrand.style.display = "none";
        this.recipeStrand.style.display = "none";
        this.addIngredientStrand.style.display = "none";
        this.enterTransactionsStrand.style.display = "none";
    }
}

controller.onStart();