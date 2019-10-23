let ingredientSetup = {
    existingIngredientElements: [], // each object in list is a full tr for one ingredient
    newIngredientElements: [],  // each object in list is a full tr for one ingredient

    //Loops through all ingredients passed from database
    //Creates a row for each ingredient and adds it to table
    populateIngredients: function(){
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
            unit.innerText = ingredient.unit;
            row.appendChild(unit);
        
            let idField = document.createElement("input");
            idField.type = "hidden";
            idField.value = ingredient._id;
        
            tBody.appendChild(row);
            let oldTBody = document.querySelector("#ingredient-display tbody");
            oldTBody.parentNode.replaceChild(tBody, oldTBody);
            this.existingIngredientElements.push(row);

            this.displayExistingIngredients();
        }
    },

    //Display existing ingredients table
    //Hide other tables
    displayExistingIngredients: function(){
        addIngredients.style.display = "flex";
        newIngredients.style.display = "none";
        createRecipes.style.display = "none";
    },

    //Display new ingredients table
    //Hide other tables
    displayNewIngredients: function(){
        addIngredients.style.display = "none";
        newIngredients.style.display = "flex";
        createRecipes.style.display = "none";
    },

    //Creates a new, empty row in table to input data
    newIngredientField: function(){
        let body = document.querySelector("#inputField tbody");
        let row = document.createElement("tr");
    
        let name = document.createElement("td");
        let nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.onblur = ()=>{checkValid("name", nameInput)};
        name.appendChild(nameInput);
        row.appendChild(name);
    
        let category = document.createElement("td");
        let categoryInput = document.createElement("input");
        categoryInput.type = "text"
        categoryInput.onblur = ()=>{checkValid("category", categoryInput)};
        category.appendChild(categoryInput);
        row.appendChild(category);
    
        let quantity = document.createElement("td");
        let quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.step = "0.01";
        quantityInput.onblur = ()=>{checkValid("quantity", quantityInput)};
        quantity.appendChild(quantityInput);
        row.appendChild(quantity);
    
        let unit = document.createElement("td");
        let unitInput = document.createElement("input");
        unitInput.type = "text";
        unitInput.onblur = ()=>{checkValid("unit", unitInput)};
        unit.appendChild(unitInput);
        row.appendChild(unit);
    
        let removeTd = document.createElement("td");
        let removeButton = document.createElement("button");
        removeButton.innerText = "-";
        removeButton.onclick = ()=>{this.removeRow(row)};
        removeTd.appendChild(removeButton);
        row.appendChild(removeTd);
    
        body.appendChild(row);
        this.newIngredientElements.push(row);
    },

    //Remove row from new ingredients table
    removeRow: function(row){
        for(let i = 0; i < this.newIngredientElements.length; i++){
            if(this.newIngredientElements[i] === row){
                this.newIngredientElements.splice(i, 1);
            }
        }
        row.parentNode.removeChild(row);
    },

    //refactor
    //nothin should run unless everything is valid
    createIngredientsList: function(){
        data.ingredients = [];
        for(let ingredient of this.existingIngredientElements){
            if(ingredient.children[0].children[0].checked){
                data.ingredients.push({
                    id: ingredient.id,
                    name: ingredient.children[1].textContent,
                    quantity: ingredient.children[3].children[0].value,
                    unit: ingredient.children[4].textContent
                });
            }
        }
    
        let newIngredient = [];
        let newIngredientQuantity = [];
        for(let ingredient of this.newIngredientElements){
            newIngredient.push({
                name: ingredient.children[0].children[0].value,
                category: ingredient.children[1].children[0].value,
                unit: ingredient.children[3].children[0].value
            });
            newIngredientQuantity.push({
                name: ingredient.children[0].children[0].value,
                quantity: ingredient.children[2].children[0].value
            });
        }
    
        let isValid = true;
        for(let i = 0; i < newIngredient.length; i++){
            if(!validator.ingredient.all(newIngredient[i], newIngredientQuantity[i].quantity)){
                isValid = false;
                data.ingredients = [];
                break;
            }
        }
    
        if(isValid){
            axios.post("/ingredients/create", newIngredient)
                .then((result)=>{
                    for(let ingredient of result.data){
                        let newIngredient = {
                            id: ingredient._id,
                            name: ingredient.name,
                            unit: ingredient.unit
                        }
    
                        for(let item of newIngredientQuantity){
                            if(ingredient.name === item.name){
                                newIngredient.quantity = item.quantity;
                            }
                        }
    
                        data.ingredients.push(newIngredient);
                    }
                    banner.createNotification("All ingredients have been created and added to your inventory");
                    recipeSetup.createRecipePage();
                })
                .catch((err)=>{
                    banner.createError("There has been an error and your ingredients have not been saved");
                    console.log(err);
                });
        }
    }
};