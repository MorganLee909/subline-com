let createIngredientsObj = {
    display: function(){
        controller.clearScreen();
        controller.createIngredientsStrand.style.display = "flex";
    },

    //Creates a new, empty row in table to input data
    newIngredientField: function(){
        let tbody = document.querySelector("#inputField tbody");

        let row = document.createElement("tr");
        tbody.appendChild(row);
    
        let name = document.createElement("td");
        row.appendChild(name);

        let nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.onblur = ()=>{controller.checkValid("name", nameInput)};
        name.appendChild(nameInput);
        
        let category = document.createElement("td");
        row.appendChild(category);

        let categoryInput = document.createElement("input");
        categoryInput.type = "text"
        categoryInput.onblur = ()=>{controller.checkValid("category", categoryInput)};
        category.appendChild(categoryInput);
        
        let quantity = document.createElement("td");
        row.appendChild(quantity);

        let quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.step = "0.01";
        quantityInput.onblur = ()=>{controller.checkValid("quantity", quantityInput)};
        quantity.appendChild(quantityInput);
    
        let unit = document.createElement("td");
        row.appendChild(unit);

        let unitInput = document.createElement("input");
        unitInput.type = "text";
        unitInput.onblur = ()=>{controller.checkValid("unit", unitInput)};
        unit.appendChild(unitInput);
    
        let removeTd = document.createElement("td");
        row.appendChild(removeTd);

        let removeButton = document.createElement("button");
        removeButton.innerText = "-";
        removeButton.onclick = ()=>{row.parentNode.removeChild(row);};
        removeTd.appendChild(removeButton);
    },

    submit: function(){
        let tbody = document.querySelector("#inputField tbody");
        let isValid = true;

        let newIngredients = [];
        
        for(let row of tbody.children){
            let name = row.children[0].children[0].value;
            let category = row.children[1].children[0].value;
            let quantity = row.children[2].children[0].value;
            let unit = row.children[3].children[0].value;

            let checkName = validator.ingredient.name(name);
            let checkCategory = validator.ingredient.category(category);
            let checkQuantity = validator.ingredient.quantity(quantity);
            let checkUnit = validator.ingredient.unit(unit);

            if(checkName && checkCategory && checkQuantity && checkUnit){
                newIngredients.push({
                    name: name,
                    category: category,
                    unit: unit
                });
            }else{
                isValid = false;
                break;
            }
        }

        if(isValid){
            axios.post("/ingredients/create", newIngredients)
                .then((ingredients)=>{
                    for(let ingredient of ingredients.data){
                        controller.data.ingredients.push({
                            ingredient: {
                                id: ingredient._id,
                                name: ingredient.name,
                                category: ingredient.category,
                                unit: ingredient.unit
                            },
                            quantity: quantity
                        });
                    }

                    banner.createNotification("All ingredients have been created and added to your inventory");

                    if(recipes){
                        createRecipesObj.display();
                    }else{
                        nameRecipesObj.display();
                    }
                })
                .catch((err)=>{
                    banner.createError("There has been an error and your ingredients have not been saved");
                    console.log(err);
                });
        }
    }
}