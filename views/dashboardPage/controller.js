let changeStrand = (name)=>{
    for(let strand of document.querySelectorAll(".strand")){
        strand.style.display = "none";
    }

    for(let button of document.querySelectorAll(".menu > button")){
        button.classList = "";
        button.onclick = ()=>{changeStrand(`${button.id.slice(0, button.id.indexOf("Btn"))}Strand`)};
    }

    let activeButton = document.querySelector(`#${name.slice(0, name.indexOf("Strand"))}Btn`);
    activeButton.classList = "active";
    activeButton.onclick = undefined;

    closeSidebar();

    document.querySelector(`#${name}`).style.display = "flex";
    window[`${name}Obj`].display();
}

let closeSidebar = ()=>{
    let sidebar = document.querySelector(".sidebar");
    
    if(sidebar){
        sidebar.classList = "sidebarHide";
    }
}

//Gets the indices of two dates from transactions
//Inputs
//  from: starting date
//  to: ending date (default to now)
//Output
//  Array containing starting index and ending index
let dateIndices = (from, to = new Date())=>{
    let indices = [];

    for(let i = 0; i < transactions.length; i++){
        if(transactions[i].date > from){
            indices[0] = i;
            break;
        }
    }

    for(let i = transactions.length - 1; i >=0; i--){
        if(transactions[i].date < to){
            indices[1] = i;
            break;
        }
    }

    return indices;
}

//Gets the quantity of each ingredient sold between two dates (dateRange)
//Inputs
//  dateRange: list containing a start date and an end date
//Output
//  List of objects
//      id: id of specific ingredient
//      quantity: quantity sold of that ingredient
//      name: name of the ingredient
let ingredientsSold = (dateRange)=>{
    let recipes = recipesSold(dateRange);
    let ingredientList = [];

    for(let recipe of recipes){
        for(let merchRecipe of merchant.recipes){
            for(let ingredient of merchRecipe.ingredients){
                let exists = false;
                for(let item of ingredientList){
                    if(item.id === ingredient.ingredient._id){
                        exists = true;
                        item.quantity += ingredient.quantity * recipe.quantity;
                        break;
                    }
                }

                if(!exists){
                    ingredientList.push({
                        id: ingredient.ingredient._id,
                        quantity: ingredient.quantity * recipe.quantity,
                        name: ingredient.ingredient.name,
                        unit: ingredient.ingredient.unit
                    })
                }
            }
        }
    }

    return ingredientList;
}

//Gets the quantity of a single ingredient sold between two dates (dateRange)
let ingredientSold = (dateRange,  id)=>{
    let recipes = recipesSold(dateRange);
    let total = 0;

    let checkRecipes = [];
    let quantities = [];
    for(let merchRecipe of merchant.recipes){
        for(let merchIngredient of merchRecipe.ingredients){
            if(merchIngredient.ingredient._id === id){
                checkRecipes.push(merchRecipe._id);
                quantities.push(merchIngredient.quantity);
                break;
            }
        }
    }

    for(let recipe of recipes){
        for(let i = 0; i < checkRecipes.length; i++){
            if(checkRecipes[i] === recipe.id){
                total += recipe.quantity * quantities[i];
                break;
            }
        }
    }

    return total;
}

//Gets the number of recipes sold between two dates (dateRange)
//Inputs
//  dateRange: array containing a start date and an end date
//Output
//  List of objects
//      id: id of specific recipe
//      quantity: quantity sold of that recipe
let recipesSold = (dateRange)=>{
    let recipeList = [];

    for(let i = dateRange[0]; i <= dateRange[1]; i++){
        for(let recipe of transactions[i].recipes){
            let exists = false;
            for(let item of recipeList){
                if(item.id === recipe.recipe){
                    exists = true;
                    item.quantity += recipe.quantity;
                    break;
                }
            }

            if(!exists){
                recipeList.push({
                    id: recipe.recipe,
                    quantity: recipe.quantity
                })
            }
        }
    }

    return recipeList;
}

for(let transaction of transactions){
    transaction.date = new Date(transaction.date);
}

homeStrandObj.display();