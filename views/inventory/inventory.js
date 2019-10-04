console.log(merchant);

let fullList = [];
for(let item of merchant.inventory){
    fullList.push({
        name: item.ingredient.name,
        category: item.ingredient.category,
        quantity: item.quantity,
        unit: item.ingredient.unitType 
    });
}

let tbody = document.querySelector("tbody");

let renderIngredients = (items = fullList)=>{
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

let sortIngredients = (items = fullList)=>{
    items.sort((a, b) => (a.name > b.name) ? 1 : -1)
    renderIngredients();
}

let filter = ()=>{
    let items = [];
    let searchString = document.querySelector("#filter").value;
    for(let item of fullList){
        if(item.name.toLowerCase().includes(searchString)){
            items.push(item);
        }
    }

    renderIngredients(items);
}

sortIngredients();