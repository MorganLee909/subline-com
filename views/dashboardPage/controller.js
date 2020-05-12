/* 
Changes to a different strand
Input:
 name: name of the strand.  Must end with "Strand"
*/
let changeStrand = (name)=>{
    closeSidebar();

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

    document.querySelector(`#${name}`).style.display = "flex";
    window[`${name}Obj`].display();
}

/*
Updates all specified item in the merchant's inventory and updates the page
If ingredient doesn't exist, add it
Inputs:
 Array of objects
     id: id of ingredient
     quantity: updated quantity (optional)
     name: name of ingredient (only for new ingredient)
     category: category of ingredient (only for new ingredient)
     unit: unit of measurement (only for new ingredient)
 remove: if true, remove ingredient from inventory
 */
let updateInventory = (ingredients, remove = false)=>{
    for(let i = 0; i < ingredients.length; i++){
        let isNew = true;
        for(let j = 0; j < merchant.inventory.length; j++){
            if(merchant.inventory[j].ingredient._id === ingredients[i].id){
                if(remove){
                    merchant.inventory.splice(i, 1);
                }else{
                    merchant.inventory[j].quantity = ingredients[i].quantity;
                }

                isNew = false;
                break;
            }
        }

        if(isNew){
            merchant.inventory.push(ingredients[i]);
        }
    }

    homeStrandObj.drawInventoryCheckCard();
    ingredientsStrandObj.populateIngredients();
}

//Close any open sidebar
let closeSidebar = ()=>{
    let sidebar = document.querySelector("#sidebarDiv");
    for(let i = 0; i < sidebar.children.length; i++){
        sidebar.children[i].style.display = "none";
    }
    sidebar.classList = "sidebarHide";
}

/*
Open a specific sidebar
Input:
 sidebar: the outermost element of the sidebar (must contain class sidebar)
*/
let openSidebar = (sidebar)=>{
    document.querySelector("#sidebarDiv").classList = "sidebar";

    let sideBars = document.querySelector("#sidebarDiv").children;
    for(let i = 0; i < sideBars.length; i++){
        sideBars[i].style.display = "none";
    }

    sidebar.style.display = "flex";
}

/*
Gets the indices of two dates from transactions
Inputs
 from: starting date
 to: ending date (default to now)
Output
 Array containing starting index and ending index
Note: Will return false if it cannot find both necessary dates
*/
let dateIndices = (from, to = new Date())=>{
    let indices = [];

    for(let i = 0; i < transactions.length; i++){
        if(transactions[i].date > from){
            indices.push(i);
            break;
        }
    }

    for(let i = transactions.length - 1; i >=0; i--){
        if(transactions[i].date < to){
            indices.push(i);
            break;
        }
    }

    if(indices.length < 2){
        return false;
    }

    return indices;
}
/*
Gets the quantity of each ingredient sold between two dates (dateRange)
Inputs
 dateRange: list containing a start date and an end date
Output
 List of objects
     id: id of specific ingredient
     quantity: quantity sold of that ingredient
     name: name of the ingredient
*/
let ingredientsSold = (dateRange)=>{
    if(!dateRange){
        return false;
    }
    
    let recipes = recipesSold(dateRange);
    let ingredientList = [];

    for(let i = 0; i < recipes.length; i++){
        for(let j = 0; j < merchant.recipes.length; j++){
            for(let k = 0; k < merchant.recipes[j].ingredients.length; k++){
                let exists = false;
                for(let l = 0; l < ingredientList.length; l++){
                    if(ingredientList[l].id === merchant.recipes[j].ingredients[k].ingredient._id){
                        exists = true;
                        ingredientList[l].quantity += merchant.recipes[j].ingredients[k].quantity * recipes[i].quantity;
                        break;
                    }
                }

                if(!exists){
                    ingredientList.push({
                        id: merchant.recipes[j].ingredients[k].ingredient._id,
                        quantity: merchant.recipes[j].ingredients[k].quantity * recipes[i].quantity,
                        name: merchant.recipes[j].ingredients[k].ingredient.name,
                        unit: merchant.recipes[j].ingredients[k].ingredient.unit
                    })
                }
            }
        }
    }

    return ingredientList;
}
/*
Gets the quantity of a single ingredient sold between two dates (dateRange)
Input:
    dateRange: array containing two elements, start and end indices
    id: id of the ingredient to calculate
Return: (int) Quantity of recipes sold
*/
let ingredientSold = (dateRange,  id)=>{
    let recipes = recipesSold(dateRange);
    let total = 0;

    let checkRecipes = [];
    let quantities = [];
    for(let i = 0; i < merchant.recipes.length; i++){
        for(let j = 0; j < merchant.recipes[i].ingredients.length; j++){
            if(merchant.recipes[i].ingredients[j].ingredient._id === id){
                checkRecipes.push(merchant.recipes[i]._id);
                quantities.push(merchant.recipes[i].ingredients[j].quantity);
                break;
            }
        }
    }

    for(let i = 0; i < recipes.length; i++){
        for(let i = 0; i < checkRecipes.length; i++){
            if(checkRecipes[i] === recipes[i].id){
                total += recipes[i].quantity * quantities[i];
                break;
            }
        }
    }

    return total;
}
/*
Gets the number of recipes sold between two dates (dateRange)
Inputs:
    dateRange: array containing a start date and an end date
Return:
    List of objects
        id: id of specific recipe
        quantity: quantity sold of that recipe
*/
let recipesSold = (dateRange)=>{
    let recipeList = [];

    for(let i = dateRange[0]; i <= dateRange[1]; i++){
        for(let j = 0; j < transactions[i].recipes.length; j++){
            let exists = false;
            for(let k = 0; k < recipeList.length; k++){
                if(recipeList[k].id === transactions[i].recipes[j].recipe){
                    exists = true;
                    recipeList[k].quantity += transactions[i].recipes[j].quantity;
                    break;
                }
            }

            if(!exists){
                recipeList.push({
                    id: transactions[i].recipes[j].recipe,
                    quantity: transactions[i].recipes[j].quantity
                })
            }
        }
    }

    return recipeList;
}

/*
Groups all of the merchant's ingredients by their category
Return:
    Array of objects
        ingredients: Array of objects
            id: Id of ingredient
            name: Name of ingredient
            quantity:  Merchant's quantity of this ingredient
            unit: Measurement unit
        name: Category name
*/
let categorizeIngredients = ()=>{
    let ingredientsByCategory = [];

    for(let i = 0; i < merchant.inventory.length; i++){
        let categoryExists = false;
        for(let j = 0; j < ingredientsByCategory.length; j++){
            if(merchant.inventory[i].ingredient.category === ingredientsByCategory[j].name){
                ingredientsByCategory[j].ingredients.push({
                    id: merchant.inventory[i].ingredient._id,
                    name: merchant.inventory[i].ingredient.name,
                    quantity: merchant.inventory[i].quantity,
                    unit: merchant.inventory[i].ingredient.unit
                });

                categoryExists = true;
                break;
            }
        }

        if(!categoryExists){
            ingredientsByCategory.push({
                name: merchant.inventory[i].ingredient.category,
                ingredients: [{
                    id: merchant.inventory[i].ingredient._id,
                    name: merchant.inventory[i].ingredient.name,
                    quantity: merchant.inventory[i].quantity,
                    unit: merchant.inventory[i].ingredient.unit
                }]
            });
        }
    }

    return ingredientsByCategory;
}

for(let transaction of transactions){
    transaction.date = new Date(transaction.date);
}

homeStrandObj.display();