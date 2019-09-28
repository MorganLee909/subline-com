let state = 0;
let data = {};

let addIngredients = document.querySelector("#addIngredients");
let newIngredients = document.querySelector("#newIngredients");
let existingIngredientElements = [];
let newIngredientElements = [];

let updateState = (num)=>{
    state += num;
    if(state === 0){
        addIngredients.style.display = "flex";
        newIngredients.style.display = "none";
    }else if(state === 1){
        addIngredients.style.display = "none";
        newIngredients.style.display = "flex";
    }else if(state === 2){
        collectNewIngredients();
    }
}

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


populateIngredients();
updateState(0);