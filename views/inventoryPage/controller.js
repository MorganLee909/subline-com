let controller = {
    inventoryStrand: document.querySelector("#inventoryStrand"),
    addIngredientStrand: document.querySelector("#addIngredientStrand"),
    enterTransactionsStrand: document.querySelector("#enterTransactionsStrand"),
    enterPurchaseStrand: document.querySelector("#enterPurchaseStrand"),

    onStart: function(){
        if(error){
            banner.createError(error);
        }

        inventoryObj.display();
    },

    clearScreen: function(){
        this.inventoryStrand.style.display = "none";
        this.addIngredientStrand.style.display = "none";
        this.enterTransactionsStrand.style.display = "none";
        this.enterPurchaseStrand.style.display = "none";
    }
}

controller.onStart();