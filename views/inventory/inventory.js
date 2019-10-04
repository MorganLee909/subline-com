let items = [];
let tbody = document.querySelector("tbody");

let renderIngredients = ()=>{
    while(tbody.hasChildNodes()){
        tbody.removeChild(tbody.firstChild);
    }

    for(let item of items){
        let row = document.createElement("tr");
        tbody.appendChild(row);

        let name = document.createElement("td");
        name.innerText = item.name;
        row.appendChild(name);

        let category = document.createElement("td");
        category.innerText = item.category;
        row.appendChild(category);

        let quantity = document.createElement("td");
        quantity.innerText = item.quantity;
        row.appendChild(quantity);

        let unit = document.createElement("td");
        unit.innerText = item.unit;
        row.appendChild(unit);
    }
}

let sortIngredients = (property)=>{
    items.sort((a, b) => (a[property] > b[property]) ? 1 : -1);
    renderIngredients();
}

let filter = ()=>{
    items = [];
    let searchString = document.querySelector("#filter").value;
    for(let item of merchant.inventory){
        if(item.ingredient.name.toLowerCase().includes(searchString)){
            items.push({
                name: item.ingredient.name,
                category: item.ingredient.category,
                quantity: item.quantity,
                unit: item.ingredient.unitType
            });
        }
    }

    sortIngredients("name");
    renderIngredients(items);
}

filter();