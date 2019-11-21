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
        console.log("something else");
        console.log(tbody);

        while(tbody.children.length > 0){
            tbody.removeChild(tbody.firstChild);
        }

        for(let item of this.items){
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
            editBtn.onclick = ()=>{this.editIngredient(item.id, row)};
            editBtn.innerText = "Edit";
            editBtn.className = "edit-button"
            action.appendChild(editBtn);

            let removeBtn = document.createElement("button");
            removeBtn.onclick = ()=>{this.removeIngredient(item.id, row)};
            removeBtn.innerText = "Remove";
            removeBtn.className = "edit-button";
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
                    id: item._id,
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
            let updateIngredient = merchant.inventory.find(i => i._id === id);
            updateIngredient.quantity = quantity;
            axios.post("/merchant/ingredients/update", {ingredientId: id, quantity: quantity})
                .then((merchant)=>{
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
        button.onclick = ()=>{this.editIngredient(id, row)};
    },

    //Delete an ingredient from both the page and the database
    removeIngredient: function(id, row){
        axios.post("/merchant/ingredients/remove", {ingredientId: id})
            .then(()=>{
                for(let i = 0; i < merchant.inventory.length; i++){
                    if(id === merchant.inventory[i]._id){
                        merchant.inventory.splice(i, 1);
                        break;
                    }
                }

                row.parentNode.removeChild(row);

                banner.createNotification("The ingredient has been removed from your inventory");
            })
            .catch((err)=>{
                banner.createError("There was an error and the ingredient has not been removed from your inventory");
                console.log(err);
            });
    },   
}