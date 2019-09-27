console.log(ingredients);

//Populate all ingredients into the table
let table = document.querySelector("#ingredient-display");
let createDiv = document.querySelector("#new-ingredient");
createDiv.style.display = "none";

let existingIngredients = [];
let newIngredients = [];
let data = {};

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
    console.log(ingredient);
    idField.type = "hidden";
    idField.value = ingredient._id;

    table.appendChild(row);
    existingIngredients.push(row);
}

//Gather all data from both forms and submit
let subData = ()=>{
    data.existing = [];
    for(let ingredient of existingIngredients){
        if(ingredient.childNodes[0].firstChild.checked){
            data.existing.push(ingredient.id);
        }
    }

    table.style.display = "none";
    createDiv.style.display = "block";
}

//Add a field for inputing a new ingredient
let addField = ()=>{
    let ingredient = document.createElement("div");
    ingredient.classList += "input-new";

    let name = document.createElement("input");
    name.type = "text";
    ingredient.appendChild(name);

    let category = document.createElement("input");
    category.type = "text";
    ingredient.appendChild(category);

    let quantity = document.createElement("input");
    quantity.type = "number";
    quantity.step = "0.01";
    ingredient.appendChild(quantity);

    let unit = document.createElement("input");
    unit.type = "text";
    ingredient.appendChild(unit);

    div.appendChild(ingredient);
    newIngredients.push(ingredient);
}