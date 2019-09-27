console.log(ingredients);

//Populate all ingredients into the table
let table = document.querySelector("#ingredient-display");

for(let ingredient of ingredients){
    let row = document.createElement("tr");

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

    table.appendChild(row);
}