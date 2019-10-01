console.log(ingredients);
console.log(recipes);

let state = 0;
let data = {};

let addIngredients = document.querySelector("#addIngredients");
let newIngredients = document.querySelector("#newIngredients");
let createRecipes = document.querySelector("#createRecipes");
let existingIngredientElements = [];
let newIngredientElements = [];
let recipeData = [];
let recipeDataIndex = 0;

for(let recipe of recipes.elements){
    recipeData.push(
        {
            id: recipe.id,
            name: recipe.name,
            ingredients: []
        }
    )
}

let updateState = (num)=>{
    state += num;
    if(state === 0){
        addIngredients.style.display = "flex";
        newIngredients.style.display = "none";
        createRecipes.style.display = "none";
    }else if(state === 1){
        addIngredients.style.display = "none";
        newIngredients.style.display = "flex";
        createRecipes.style.display = "none";
    }else if(state === 2){
        addIngredients.style.display = "none";
        newIngredients.style.display = "none";
        createRecipes.style.display = "flex";
        createIngredientsList();
        showRecipe();
    }
}

//Ingredient functions
let populateIngredients = ()=>{
    let tBody = document.createElement("tbody");

    for(let ingredient of ingredients){
        let row = document.createElement("tr");
        row.id = ingredient._id;
    
        let add = document.createElement("td");
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        add.appendChild(checkbox);
        row.appendChild(add);
    
        let name = document.createElement("td");
        name.innerText = ingredient.name;
        row.appendChild(name);
    
        let category = document.createElement("td");
        category.innerText = ingredient.category;
        row.appendChild(category);
    
        let quantity = document.createElement("td");
        let quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.step = "0.01";
        quantityInput.min = "0";

        quantity.appendChild(quantityInput);
        row.appendChild(quantity);
        let unit = document.createElement("td");
        unit.innerText = ingredient.unitType;
        row.appendChild(unit);
    
        let idField = document.createElement("input");
        idField.type = "hidden";
        idField.value = ingredient._id;
    
        tBody.appendChild(row);
        let oldTBody = document.querySelector("#ingredient-display tbody");
        oldTBody.parentNode.replaceChild(tBody, oldTBody);
        existingIngredientElements.push(row);
    }
}

let newIngredientField = ()=>{
    let inputField = document.querySelector("#inputField");
    let row = document.createElement("tr");

    let name = document.createElement("td");
    let nameInput = document.createElement("input");
    nameInput.type = "text";
    name.appendChild(nameInput);
    row.appendChild(name);

    let category = document.createElement("td");
    let categoryInput = document.createElement("input");
    categoryInput.type = "text"
    category.appendChild(categoryInput);
    row.appendChild(category);
    let quantity = document.createElement("td");
    let quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.step = "0.01";
    quantity.appendChild(quantityInput);
    row.appendChild(quantity);

    let unit = document.createElement("td");
    let unitInput = document.createElement("input");
    unitInput.type = "text";
    unit.appendChild(unitInput);
    row.appendChild(unit);

    inputField.appendChild(row);
    newIngredientElements.push(row);
}

let createIngredientsList = ()=>{
    data.existing = [];
    for(let ingredient of existingIngredientElements){
        if(ingredient.childNodes[0].childNodes[0].checked){
            data.existing.push({
                id: ingredient.id,
                name: ingredient.childNodes[1].childNodes[0].nodeValue,
                category: ingredient.childNodes[2].childNodes[0].nodeValue,
                quantity: ingredient.childNodes[3].childNodes[0].value
            });
        }
    }

    data.new = [];
    let id = 0;
    for(let ingredient of newIngredientElements){
        data.new.push({
            id: id,
            name: ingredient.childNodes[0].childNodes[0].value,
            category: ingredient.childNodes[1].childNodes[0].value,
            quantity: ingredient.childNodes[2].childNodes[0].value,
            unitType: ingredient.childNodes[3].childNodes[0].value
        });
        id++;
    }
}

//Recipe functions
let showRecipe = ()=>{
    let title = document.querySelector("#recipeName");
    title.innerText = recipeData[recipeDataIndex].name;

    let body = document.querySelector("#recipes tbody");
    for(let ing of recipeData[recipeDataIndex].ingredients){
        let row = document.createElement("tr");
        body.appendChild(row);

        let ingTd = document.createElement("td");
        row.appendChild(ingTd);
        let ingName = document.createElement("select");
        for(let ingredient of data.existing){
            let newOption = document.createElement("option");
            newOption.innerText = ingredient.name;
            newOption.value = ingredient.id;
            ingName.appendChild(newOption);
        }
        for(let ingredient of data.new){
            let newOption = document.createElement("option");
            newOption.innerText = ingredient.name;
            newOption.value = ingredient.name;
            ingName.appendChild(newOption);
        }
        ingTd.appendChild(ingName);

        let quantTd = document.createElement("td");
        row.appendChild(quantTd);
        let ingQuant = document.createElement("input");
        ingQuant.type = "number";
        ingQuant.step = "0.01";
        ingQuant.value = ing.quantity;
        quantTd.appendChild(ingQuant);
    }

    let nextButton = document.querySelector("#next");
    if(recipeDataIndex === recipeData.length - 1){
        nextButton.innerText = "Finish";
        nextButton.onclick = submitAll;
    }else{
        nextButton.innerText = "Next Recipe";
        nextButton.onclick = ()=>{changeRecipe(1)};
    }

    let previousButton = document.querySelector("#previous");
    if(recipeDataIndex === 0){
        previousButton.style.display = "none";
    }else{
        previousButton.style.display = "inline-block";
    }
}

let addRecipeIngredientField = ()=>{
    let body = document.querySelector("#recipes tbody");

    let row = document.createElement("tr");
    body.appendChild(row);

    let ingTd = document.createElement("td");
    row.appendChild(ingTd);
    let ingName = document.createElement("select");
    for(let ingredient of data.existing){
        let newOption = document.createElement("option");
        newOption.innerText = ingredient.name;
        newOption.value = ingredient.id;
        ingName.appendChild(newOption);
    }
    for(let ingredient of data.new){
        let newOption = document.createElement("option");
        newOption.innerText = ingredient.name;
        newOption.value = ingredient.id;
        ingName.appendChild(newOption);
    }
    ingTd.appendChild(ingName);

    let quantTd = document.createElement("td");
    row.appendChild(quantTd);
    let ingQuant = document.createElement("input");
    ingQuant.type = "number";
    ingQuant.step = "0.01";
    ingQuant.min = "0";
    quantTd.appendChild(ingQuant);
}

let changeRecipe = (num)=>{
    let body = document.querySelector("#recipes tbody");

    let recipeIngredients = [];
    while(body.hasChildNodes()){
        let row = body.firstChild;
        recipeIngredients.push({
            id: row.childNodes[0].childNodes[0].value,
            quantity: row.childNodes[1].childNodes[0].value
        });
        recipeData[recipeDataIndex].ingredients = recipeIngredients;

        body.removeChild(row);
    }
    recipeDataIndex += num;
    showRecipe();
}

let submitAll = ()=>{
    data.recipes = [];

    for(let recipe of recipeData){
        let newRecipe = {
            id: recipe.id,
            ingredients: []
        };
        for(let ingredient of recipe.ingredients){
            newRecipe.ingredients.push({
                id: ingredient.id,
                quantity: ingredient.quantity
            });
        }
        data.recipes.push(newRecipe);
    }
    console.log(data);
}

populateIngredients();
updateState(0);