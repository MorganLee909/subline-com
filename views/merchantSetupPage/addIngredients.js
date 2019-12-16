addIngredientsObj = {
    isPopulated: false,

    display: function(){
        controller.clearScreen();
        controller.addIngredientsStrand.style.display = "flex";

        if(!this.isPopulated){
            this.populate();
            this.isPopulated = true;
        }
    },

    populate: function(){
        let tbody = document.querySelector("#ingredient-display tbody");
    
        for(let ingredient of ingredients){
            let row = document.createElement("tr");
            row.id = ingredient._id;
            tbody.appendChild(row);
        
            let add = document.createElement("td");
            row.appendChild(add);

            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            add.appendChild(checkbox);
            
            let name = document.createElement("td");
            name.innerText = ingredient.name;
            row.appendChild(name);
        
            let category = document.createElement("td");
            category.innerText = ingredient.category;
            row.appendChild(category);
        
            let quantity = document.createElement("td");
            row.appendChild(quantity);

            let quantityInput = document.createElement("input");
            quantityInput.type = "number";
            quantityInput.step = "0.01";
            quantityInput.min = "0";
            quantityInput.classList = "inputField";
            quantity.appendChild(quantityInput);
            
            let unit = document.createElement("td");
            unit.innerText = ingredient.unit;
            row.appendChild(unit);
        }
    },

    submit: function(){
        controller.data.inventory = [];

        let tbody = document.querySelector("#ingredient-display tbody");
        let isValid = true;
        for(let row of tbody.children){
            if(row.children[0].children[0].checked){
                let quantity = row.children[3].children[0].value;

                if(quantity === ""){
                    banner.createError("Must provide a quantity for all checked ingredients");
                    return;
                }

                if(validator.ingredient.quantity(quantity)){
                    controller.data.inventory.push({
                        ingredient: {
                            id: row.id,
                            name: row.children[1].innerText,
                            category: row.children[2].innerText,
                            unit: row.children[4].innerText
                        },
                        quantity: quantity
                    });
                }else{
                    isValid = false;
                    break;
                }
            }
        }

        if(isValid){
            createIngredientsObj.display();
        }
    }
}