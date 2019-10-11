let data = {};

let addIngredients = document.querySelector("#addIngredients");
let newIngredients = document.querySelector("#newIngredients");
let createRecipes = document.querySelector("#createRecipes");

let checkValid = (valueToCheck, inputField)=>{
    if(!validator.ingredient[valueToCheck](inputField.value, createBanner = false)){
        inputField.classList += " input-error"
    }else{
        inputField.classList.remove("input-error");
    }
}

ingredientSetup.populateIngredients();