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
        populateIngredients();
    }else if(state === 1){
        collectIngredients();
        addIngredients.style.display = "none";
        newIngredients.style.display = "flex";
    }
}

let populateIngredients = ()=>{
    let table = document.querySelector("#ingredient-display");
    console.log(ingredients);

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
    
        table.appendChild(row);
        existingIngredientElements.push(row);
    }
}

let collectIngredients = ()=>{
    let selectedIngredients = []
    for(let ingredient of existingIngredientElements){
        if(ingredient.childNodes[0].firstChild.checked){
            selectedIngredients.push(ingredient.id);
        }
    }

    data.existing = selectedIngredients;
}

let newIngredientField = ()=>{
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
    newIngredientElements.push(ingredient);
}

updateState(0);