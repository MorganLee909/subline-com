/* 
Switches to a different strand
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
     quantityChange: change in quantity (if not removing)
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
                    merchant.inventory.splice(j, 1);
                }else{

                    merchant.inventory[j].quantity += ingredients[i].quantity;
                }

                isNew = false;
                break;
            }
        }

        if(isNew){
            merchant.inventory.push({

                ingredient: {
                    _id: ingredients[i].id,
                    category: ingredients[i].category,
                    name: ingredients[i].name,
                    unit: ingredients[i].unit
                },
                quantity: parseFloat(ingredients[i].quantityChange)
            });
        }
    }

    homeStrandObj.drawInventoryCheckCard();
    ingredientsStrandObj.populateByProperty("category");
    addIngredientsComp.isPopulated = false;
    closeSidebar();
}

/*
Updates a recipe in the merchants list of recipes
Can create, edit or remove
Inputs:
    recipe: object
        _id: id of recipe
        name: name of recipe
        price: price of recipe
        ingredients: list of ingredients
            ingredient: id of ingredient
            quantity: quantity of ingredient
    remove: if true, remove ingredient from inventory
*/
let updateRecipes = (recipe, remove = false)=>{
    let isNew = true;
    let index = 0;

    for(let i = 0; i < recipe.ingredients.length; i++){
        for(let j = 0; j < merchant.inventory.length; j++){
            if(merchant.inventory[j].ingredient._id === recipe.ingredients[i].ingredient){
                recipe.ingredients[i].ingredient = merchant.inventory[j].ingredient;
                break;
            }
        }
    }

    for(let i = 0; i < merchant.recipes.length; i++){
        if(recipe._id === merchant.recipes[i]._id){
            if(remove){
                merchant.recipes.splice(i, 1);
            }else{
                merchant.recipes[i] = recipe;
                index = i;
            }

            isNew = false;
            break;
        }
    }

    if(isNew){
        merchant.recipes.push(recipe);
        index = merchant.recipes.length - 1;
    }

    recipeBookStrandObj.populateRecipes();
    closeSidebar();
}

/*
Updates an order in the front end
Can create, edit or remove
order = {
    _id: id of recipe,
    name: name of recipe,
    price: price of recipe,
    ingredients: [
        ingredient: id of ingredient,
        quantity: quantity of ingredient
    ]
}
*/
let updateOrders = (order, remove = false)=>{
    let isNew = true;

    for(let i = 0; i < orders.length; i++){
        if(orders[i]._id === order._id){
            if(remove){
                orders.splice(i, 1);
            }else{
                orders[i] = order;
            }

            isNew = false;
        }
    }

    if(isNew){
        orders.push(order);
    }

    ordersStrandObj.isPopulated = false;
    ordersStrandObj.display();
    closeSidebar();
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

let unitizeIngredients = (ingredients)=>{
    let ingredientsByUnit = [];

    for(let i = 0; i < ingredients.length; i++){
        let unitExists = false;
        for(let j = 0; j < ingredientsByUnit.length; j++){
            if(ingredients[i].ingredient.unit === ingredientsByUnit[j].name){
                ingredientsByUnit[j].ingredients.push({
                    id: ingredients[i].ingredient._id,
                    name: ingredients[i].ingredient.name,
                    quantity: ingredients[i].quantity,
                    unit: ingredients[i].ingredient.unit
                });

                unitExists = true;
                break;
            }
        }

        if(!unitExists){
            ingredientsByUnit.push({
                name: ingredients[i].ingredient.unit,
                ingredients: [{
                    id: ingredients[i].ingredient._id,
                    name: ingredients[i].ingredient.name,
                    quantity: ingredients[i].quantity,
                    unit: ingredients[i].ingredient.unit
                }]
            })
        }
    }

    return ingredientsByUnit;
}

let categorizeIngredientsFromDB = (ingredients)=>{
    let ingredientsByCategory = [];

    for(let i = 0; i < ingredients.length; i++){
        let categoryExists = false;
        for(let j = 0; j < ingredientsByCategory.length; j++){
            if(ingredients[i].category === ingredientsByCategory[j].name){
                ingredientsByCategory[j].ingredients.push({
                    id: ingredients[i]._id,
                    name: ingredients[i].name,
                    unit: ingredients[i].unit
                });

                categoryExists = true;
                break;
            }
        }

        if(!categoryExists){
            ingredientsByCategory.push({
                name: ingredients[i].category,
                ingredients: [{
                    id: ingredients[i]._id,
                    name: ingredients[i].name,
                    unit: ingredients[i].unit
                }]
            });
        }
    }

    return ingredientsByCategory;
}

let recipesForIngredient = (ingredientId)=>{
    let recipes = [];

    for(let i = 0; i < merchant.recipes.length; i++){
        for(let j = 0; j < merchant.recipes[i].ingredients.length; j++){
            if(merchant.recipes[i].ingredients[j].ingredient._id === ingredientId){
                recipes.push(merchant.recipes[i]);
                break;
            }
        }
    }

    return recipes;
}

homeStrandObj.display();