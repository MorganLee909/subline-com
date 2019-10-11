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

        let action = document.createElement("td");
        row.appendChild(action);

        let editBtn = document.createElement("button");
        editBtn.onclick = ()=>{editIngredient(item.id, row)};
        editBtn.innerText = "Edit";
        editBtn.className = "edit-button"
        action.appendChild(editBtn);

        let removeBtn = document.createElement("button");
        removeBtn.onclick = ()=>{removeIngredient(item.id, row)};
        removeBtn.innerText = "Remove";
        removeBtn.className = "edit-button";
        action.appendChild(removeBtn);
    }
}

let sortIngredients = (property)=>{
    items.sort((a, b) => (a[property] > b[property]) ? 1 : -1);
    renderIngredients();
}

let filter = ()=>{
    items = [];
    let searchString = document.querySelector("#filter").value.toLowerCase();
    for(let item of merchant.inventory){
        if(item.ingredient.name.toLowerCase().includes(searchString)){
            items.push({
                id: item.ingredient._id,
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

let editIngredient = (id, row)=>{
    let quantity = row.children[2];
    let button = row.children[4].children[0];
    let originalQuantity = quantity.innerText;

    let quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.step = "0.01";
    quantityInput.value = quantity.innerText;

    quantity.innerText = "";
    quantity.appendChild(quantityInput);

    button.innerText = "Save";
    button.onclick = ()=>{updateOne(id, row, originalQuantity)};
}

let updateOne = (id, row, originalQuantity)=>{
    let quantityField = row.children[2];
    let quantity = quantityField.children[0].value;
    let button = row.children[4].children[0];

    quantityField.removeChild(quantityField.firstChild);

    if(validator.ingredient.quantity(quantity)){
        axios.post("/ingredients/update", {
            id: id,
            quantity: quantity
        })
            .then((ingredient)=>{
                banner.createNotification("The ingredient has been successfully updated");
            })
            .catch((err)=>{
                banner.createError("There was an error and the ingredient was not updated");
                console.log(err);
            });

        quantityField.innerText = quantity;
    }else{
        quantityField.innerText = originalQuantity;
    }

    button.innerText = "Edit";
    button.onclick = ()=>{editThis(item.id, row)};
}

let removeIngredient = (id, row)=>{
    axios.post("/ingredients/remove", {id: id})
        .then((merchant)=>{
            for(let i = 0; i < items.length; i++){
                if(id === items[i].id){
                    items.splice(i, 1);
                }
            }
            banner.createNotification("The ingredient has been removed from your inventory");
            renderIngredients();
        })
        .catch((err)=>{
            banner.createError("There was an error and the ingredient has not been removed from your inventory");
            console.log(err);
        });
}

let displayAdd = ()=>{
    let modal = document.querySelector(".add-ingredient");

    let removeModal = (modal)=>{modal.style.visibility = "hidden";}

    modal.onclick = ()=>{removeModal(modal);}

    modal.style.visibility = "visible";
}

let addIngredient = ()=>{
    let content = document.querySelector(".modal-content");

    let newIngredient = {
        ingredient: {
            name: content.children[0].children[0].value,
            category: content.children[1].children[0].value,
            unitType: content.children[3].children[0].value
        },
        quantity: content.children[2].children[0].value
    }

    if(validator.ingredient.all(newIngredient.ingredient, newIngredient.quantity)){
        axios.post("/ingredients/createone", newIngredient)
            .then((ingredient)=>{
                items.push({
                    id: ingredient._id,
                    name: newIngredient.ingredient.name,
                    category: newIngredient.ingredient.category,
                    quantity: newIngredient.quantity,
                    unit: newIngredient.ingredient.unitType
                })
                
                sortIngredients("name");
                renderIngredients();
                banner.createNotification("The new ingredient has been successfully added to your inventory");
            })
            .catch((err)=>{
                banner.createError("There was an error and the ingredient could not be added to your inventory");
                console.log(err);
            });
    }

    let modal = document.querySelector(".add-ingredient");
    modal.style.visibility = "hidden";
}

filter();