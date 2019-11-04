let inventoryPage = {
    items: [], //the ingredients to be displayed
    currentSort: "", //boolean used for sorting

    //Remove any existing ingredients in table
    //loop through this.items and create rows for the table
    renderIngredients: function(){
        let tbody = document.querySelector(".container table tbody");
        while(tbody.hasChildNodes()){
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
        this.renderIngredients();
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
        this.renderIngredients(this.items);
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
                for(let i = 0; i < this.items.length; i++){
                    if(id === this.items[i].id){
                        this.items.splice(i, 1);
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

    //Display the modal to allow for adding a new ingredient
    displayAdd: function(){
        document.querySelector("#existingIngredient").style.display = "block";
        document.querySelector("#quantityInput").style.display = "none";
        document.querySelector("#newIngredient").style.display = "none";
        document.querySelector("#createNew").onclick = ()=>{this.displayNew();};

        let modal = document.querySelector(".add-ingredient");

        let removeModal = (modal)=>{modal.style.visibility = "hidden";}

        modal.onclick = ()=>{removeModal(modal);};

        modal.style.visibility = "visible";

        axios.get("/ingredients")
            .then((ingredients)=>{
                let tbody = document.querySelector("#existingIngredient table tbody");

                while(tbody.children.length > 0){
                    tbody.removeChild(tbody.firstChild);
                }

                for(let ingredient of ingredients.data){
                    let row = document.createElement("tr");
                    tbody.appendChild(row);

                    let name = document.createElement("td");
                    name.innerText = ingredient.name;
                    row.appendChild(name);

                    let category = document.createElement("td");
                    category.innerText = ingredient.category;
                    row.appendChild(category);

                    let unit = document.createElement("td");
                    unit.innerText = ingredient.unit;
                    row.appendChild(unit);

                    let addButton = document.createElement("button");
                    addButton.innerText = "Add";
                    addButton.onclick = ()=>{this.configureAddIngredient(ingredient);};
                    row.appendChild(addButton);
                }
            })
            .catch((err)=>{
                banner.createError("Failed to retrieve ingredients list");
            });
    },

    configureAddIngredient: function(ingredient){
        document.querySelector("#existingIngredient").style.display = "none";
        document.querySelector("#quantityInput").style.display = "block";
        document.querySelector("#newIngredient").style.display = "none";
        
        document.querySelector("#quantityInputTitle").innerText = `${ingredient.name} (${ingredient.unit})`;

        let button = document.querySelector("#addIngredient");
        let input = document.querySelector("#quantityInput input");

        button.onclick = ()=>{this.addIngredient({ingredient: ingredient, quantity: input.value});};
    },

    displayNew: function(){
        document.querySelector("#existingIngredient").style.display = "none";
        document.querySelector("#quantityInput").style.display = "none";
        document.querySelector("#newIngredient").style.display = "block";
        document.querySelector("#createIngredient").onclick = ()=>{this.createIngredient();};
    },

    createIngredient: function(){
        let newItem = {
            ingredient: {
                name: document.querySelector("#newName").value,
                category: document.querySelector("#newCategory").value,
                unit: document.querySelector("#newUnit").value
            },
            quantity: document.querySelector("#newQuantity").value
        }

        this.addIngredient(newItem);
    },

    //Update new ingredient on both the page and the database
    //Close the modal
    addIngredient: function(item){
        if(validator.ingredient.all(item.ingredient, item.quantity)){
            merchant.inventory.push(item);
            if(item.ingredient._id){
                axios.post("/merchant/ingredients/create", item)
                    .then((newMerchant)=>{
                        this.filter();
                        banner.createNotification("The new ingredient has been successfully added to your inventory");
                    })
                    .catch((err)=>{
                        banner.createError("There was an error and the ingredient could not be added to your inventory");
                        console.log(err);
                    });
            }else{
                axios.post("/ingredients/createone", item)
                    .then((newMerchant)=>{
                        this.filter();
                        banner.createNotification("The new ingredient has been successfully added to your inventory");
                    })
                    .catch((err)=>{
                        console.log(err);
                        banner.createError("There was an error and the ingredient could not be added to your inventory");
                    });
            }
        }

        let modal = document.querySelector(".add-ingredient");
        modal.style.visibility = "hidden";
    }
}

inventoryPage.filter();