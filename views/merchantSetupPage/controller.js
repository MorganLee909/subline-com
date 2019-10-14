let data = {}; //For storing all data from user to pass to backend

//Divs to switch out to show different pages
let addIngredients = document.querySelector("#addIngredients");
let newIngredients = document.querySelector("#newIngredients");
let createRecipes = document.querySelector("#createRecipes");

//General purpose  data validator
let checkValid = (valueToCheck, inputField)=>{
    if(!validator.ingredient[valueToCheck](inputField.value, createBanner = false)){
        inputField.classList += " input-error"
    }else{
        inputField.classList.remove("input-error");
    }
}

//Run first function
ingredientSetup.populateIngredients();