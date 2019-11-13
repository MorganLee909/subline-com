// let data = {}; //For storing all data from user to pass to backend

// //Divs to switch out to show different pages
// let addIngredients = document.querySelector("#addIngredients");
// let newIngredients = document.querySelector("#newIngredients");
// let createRecipes = document.querySelector("#createRecipes");

// //General purpose  data validator
// let checkValid = (valueToCheck, inputField)=>{
//     if(!validator.ingredient[valueToCheck](inputField.value, createBanner = false)){
//         inputField.classList += " input-error"
//     }else{
//         inputField.classList.remove("input-error");
//     }
// }

let controller = {
    data: {},  //For storing all data from user to pass to backend

    //Component divs
    addIngredientsComp: document.querySelector("#addIngredients"),
    newIngredientsComp: document.querySelector("#newIngredients"),
    createRecipesComp: document.querySelector("#createRecipes"),

    run: function(){
        
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
        this.addIngredientsComp.style.display = "none";
        this.newIngredientsComp.style.display = "none";
        this.createRecipesComp.style.display = "none";
    }
}

//Run first function
controller.run();