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

homeStrandObj.display();