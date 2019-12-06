let controller = {
    data: {},  //For storing all data from user to pass to backend

    //Component divs
    basicInfoStrand: document.querySelector("#basicInfoStrand"),
    addIngredientsStrand: document.querySelector("#addIngredientsStrand"),
    createIngredientsStrand: document.querySelector("#createIngredientsStrand"),
    nameRecipesStrand: document.querySelector("#nameRecipesStrand"),
    createRecipesStrand: document.querySelector("#createRecipesStrand"),

    onStart: function(){
        if(error){
            banner.createError(error);
        }
        
        basicInfoObj.display();
    },

    //General purpose data validator
    checkValid: function(valueToCheck, inputField){
        if(!validator.ingredient[valueToCheck](inputField.value, createBanner = false)){
            inputField.classList += " input-error"
        }else{
            inputField.classList.remove("input-error");
        }
    },

    clearScreen: function(){
        this.basicInfoStrand.style.display = "none";
        this.addIngredientsStrand.style.display = "none";
        this.createIngredientsStrand.style.display = "none";
        this.nameRecipesStrand.style.display = "none";
        this.createRecipesStrand.style.display = "none";
    }
}

controller.onStart();