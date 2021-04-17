let editIngredient = {
    display: function(ingredient){
        let buttonList = document.getElementById("unitButtons");
        let quantLabel = document.getElementById("editIngQuantityLabel");
        let specialLabel = document.getElementById("editSpecialLabel");

        document.getElementById("editSubIngredients").onclick = ()=>{controller.openModal("editSubIngredients", ingredient.ingredient)};

        //Clear any existing data
        while(buttonList.children.length > 0){
            buttonList.removeChild(buttonList.firstChild);
        }

        //Populate basic fields
        document.getElementById("editIngTitle").innerText = ingredient.ingredient.name;
        document.getElementById("editIngName").value = ingredient.ingredient.name;
        document.getElementById("editIngCategory").value = ingredient.ingredient.category;
        quantLabel.innerText = `CURRENT STOCK (${ingredient.ingredient.unit.toUpperCase()})`;
        document.getElementById("editIngSubmit").onclick = ()=>{this.submit(ingredient)};

        //Make any changes for special ingredients
        if(ingredient.ingredient.unit === "bottle"){
            specialLabel.style.display = "flex";
            specialLabel.innerText = `BOTTLE SIZE (${ingredient.ingredient.unitType.toUpperCase()}):`;
            
            let sizeInput = document.createElement("input");
            sizeInput.id = "editIngSpecialSize";
            sizeInput.type = "number";
            sizeInput.min = "0";
            sizeInput.step = "0.01";
            sizeInput.value = ingredient.ingredient.unitSize.toFixed(2);
            specialLabel.appendChild(sizeInput);
        }else{
            specialLabel.style.display = "none";
        }

        //Populate the unit buttons
        const units = ingredient.ingredient.getPotentialUnits();

        for(let i = 0; i < units.length; i++){
            let button = document.createElement("button");
            button.classList.add("unitButton");
            button.innerText = units[i].toUpperCase();
            button.onclick = ()=>{this.changeUnit(button)};
            buttonList.appendChild(button);
            
            if(units[i] === ingredient.ingredient.unit) button.classList.add("unitActive");
        }

        let quantInput = document.createElement("input");
        quantInput.id = "editIngQuantity";
        quantInput.type = "number";
        quantInput.min = "0";
        quantInput.step = "0.01";
        quantInput.value = ingredient.quantity.toFixed(2);
        quantLabel.appendChild(quantInput);
    },

    changeUnit(button){
        let buttons = document.getElementById("unitButtons");

        for(let i = 0; i < buttons.children.length; i++){
            buttons.children[i].classList.remove("unitActive");
        }

        button.classList.add("unitActive");
    },

    submit(ingredient){
        const quantity = parseFloat(document.getElementById("editIngQuantityLabel").children[0].value);

        let data = {
            id: ingredient.ingredient.id,
            name: document.getElementById("editIngName").value,
            category: document.getElementById("editIngCategory").value,
            ingredients: []
        }

        data.quantity = ingredient.convertToBase(quantity);

        //Get the measurement unit
        let units = document.getElementById("unitButtons");
        for(let i = 0; i < units.children.length; i++){
            if(units.children[i].classList.contains("unitActive")){
                data.unit = units.children[i].innerText.toLowerCase();
                break;
            }
        }

        //Add the sub-ingredients
        for(let i = 0; i < ingredient.ingredient.subIngredients.length; i++){
            let subIngredient = ingredient.ingredient.subIngredients[i];
            data.ingredients.push({
                ingredient: subIngredient.ingredient.id,
                quantity: subIngredient.quantity 
            });
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/ingredients/update", {
            method: "put",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then((response)=>{
            if(typeof(response) === "string"){
                controller.createBanner("ERROR: CIRCULAR REFERENCE", "error");
                controller.openModal("circularReference", response);
            }else{
                merchant.removeIngredient(merchant.getIngredient(response.ingredient._id));
                merchant.addIngredients([response]);
                state.updateIngredients();
                controller.openStrand("ingredients");
                controller.createBanner("INGREDIENT UPDATED", "success");
            }
        })
        .catch((err)=>{
            controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
        })
        .finally(()=>{
            loader.style.display = "none";
        });
    }
}

module.exports = editIngredient;