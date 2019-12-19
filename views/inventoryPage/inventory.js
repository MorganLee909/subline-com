let inventoryObj = {
    items: [],
    currentSort: "",
    isPopulated: false,

    display: function(){
        controller.clearScreen();
        controller.inventoryStrand.style.display = "flex";

        if(!this.isPopulated){
            this.filter();
            this.isPopulated = true;
        }
    },

    populateIngredients: function(){
        let tbody = document.querySelector("#inventoryStrand tbody");

        while(tbody.children.length > 0){
            tbody.removeChild(tbody.firstChild);
        }

        for(let item of this.items){
            let row = document.createElement("tr");
            tbody.appendChild(row);

            let name = document.createElement("td");
            name.innerText = item.name;
            name.classList = "truncateLong";
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
            editBtn.onclick = ()=>{this.editIngredient(item.id, row)};
            editBtn.innerText = "Edit";
            editBtn.className = "button-small"
            action.appendChild(editBtn);

            let removeBtn = document.createElement("button");
            removeBtn.onclick = ()=>{this.removeIngredient(item.id, row)};
            removeBtn.innerText = "Remove";
            removeBtn.className = "button-small";
            action.appendChild(removeBtn);
        }
    },

    //sorts this.items by specified property
    sortIngredients: function(property){
        if(this.currentSort === property){
            this.items.sort((a, b) => (a[property] > b[property]) ? -1 : 1);
            this.currentSort = "";
        }else{
            this.items.sort((a, b) => (a[property] > b[property]) ? 1 : -1);
            this.currentSort = property;
        }

        this.populateIngredients();
    },

    //Empty this.items list
    //Add ingredients back to this.items list based on this.filter input
    filter: function(){
        this.items = [];
        let searchString = document.querySelector("#filter").value.toLowerCase();
        for(let item of merchant.inventory){
            if(item.ingredient.name.toLowerCase().includes(searchString)){
                this.items.push({
                    id: item.ingredient._id,
                    name: item.ingredient.name,
                    category: item.ingredient.category,
                    quantity: item.quantity,
                    unit: item.ingredient.unit
                });
            }
        }

        this.sortIngredients("name");
    },

    //Create input allowing for user edit of ingredient
    editIngredient: function(id, row){
        let quantity = row.children[2];
        let button = row.children[4].children[0];
        let originalQuantity = quantity.innerText;

        let quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.step = "0.01";
        quantityInput.onkeypress = (event)=>{if(event.keyCode===13) this.updateOne(id, row, originalQuantity)};
        quantityInput.value = quantity.innerText;

        quantity.innerText = "";
        quantity.appendChild(quantityInput);

        button.innerText = "Save";
        button.onclick = ()=>{this.updateOne(id, row, originalQuantity)};
    },

    //Save user input of ingredient
    //Update both page and database
    updateOne: function(id, row, originalQuantity){
        let quantityField = row.children[2];
        let quantity = quantityField.children[0].value;
        let button = row.children[4].children[0];

        quantityField.removeChild(quantityField.firstChild);

        if(validator.ingredient.quantity(quantity)){
            let updateIngredient = merchant.inventory.find(i => i.ingredient._id === id);
            updateIngredient.quantity = quantity;
            axios.post("/merchant/ingredients/update", {ingredientId: id, quantityChange: quantity - originalQuantity})
                .then((response)=>{
                    if(typeof(response.data) === "string"){
                        banner.createError(response.data);
                    }else{
                        banner.createNotification("The ingredient has been successfully updated");
                        quantityField.innerText = quantity;
                    }
                })
                .catch((err)=>{
                    banner.createError("Error: The ingredient could not be updated");
                });
        }else{
            quantityField.innerText = originalQuantity;
        }

        button.innerText = "Edit";
        button.onclick = ()=>{this.editIngredient(id, row)};
    },

    //Delete an ingredient from both the page and the database
    removeIngredient: function(id, row){
        let canRemove = true;
        for(let recipe of merchant.recipes){
            for(let ingredient of recipe.ingredients){
                if(ingredient.ingredient._id === id){
                    canRemove = false;
                    break;
                }
            }
        }
        if(canRemove){
            axios.post("/merchant/ingredients/remove", {ingredientId: id})
                .then((result)=>{
                    if(typeof(result.data) === "string"){
                        banner.createError(result.data);
                    }else{
                        for(let i = 0; i < merchant.inventory.length; i++){
                            if(id === merchant.inventory[i].ingredient._id){
                                merchant.inventory.splice(i, 1);
                                break;
                            }
                        }

                        row.parentNode.removeChild(row);

                        banner.createNotification("The ingredient has been removed from your inventory");
                    }
                })
                .catch((err)=>{
                    banner.createError("There was an error and the ingredient has not been removed from your inventory");
                    console.log(err);
                });
        }else{
            banner.createError("You must remove this ingredient from all recipes before you can remove it from your inventory");
        }
    },
}