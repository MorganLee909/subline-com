let editIngredient = {
    display: function(ingredient){
        let buttonList = document.getElementById("unitButtons");
        let quantLabel = document.getElementById("editIngQuantityLabel");
        let specialLabel = document.getElementById("editSpecialLabel");

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

        //Populate the unit buttons
        const units = merchant.units[ingredient.ingredient.unitType];

        for(let i = 0; i < units.length; i++){
            let button = document.createElement("button");
            button.classList.add("unitButton");
            button.innerText = units[i].toUpperCase();
            button.onclick = ()=>{this.changeUnit(button)};
            buttonList.appendChild(button);

            if(units[i] === ingredient.ingredient.unit){
                button.classList.add("unitActive");
            }
        }
        
        //Make any changes for special ingredients
        if(ingredient.ingredient.specialUnit === "bottle"){
            quantLabel.innerText = "CURRENT STOCK (BOTTLES):";

            specialLabel.style.display = "flex";
            specialLabel.innerText = `BOTTLE SIZE (${ingredient.ingredient.unit.toUpperCase()}):`;
            
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
            category: document.getElementById("editIngCategory").value
        }

        //Add data based on unit type
        if(ingredient.ingredient.specialUnit === "bottle"){
            let unitSize = ingredient.convertToBase(parseFloat(document.getElementById("editSpecialLabel").children[0].value));
            data.quantity = quantity * unitSize;
            data.unitSize = unitSize;
        }else{
            data.quantity = ingredient.convertToBase(quantity);
        }

        //Get the measurement unit
        let units = document.getElementById("unitButtons");
        for(let i = 0; i < units.children.length; i++){
            if(units.children[i].classList.contains("unitActive")){
                data.unit = units.children[i].innerText.toLowerCase();
                break;
            }
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
                banner.createError(response);
            }else{
                ingredient.ingredient.name = response.ingredient.name;
                ingredient.ingredient.category = response.ingredient.category;
                ingredient.ingredient.unitSize = response.ingredient.unitSize;
                ingredient.ingredient.unit = response.unit;

                merchant.updateIngredient(ingredient, response.quantity);
                controller.openStrand("ingredients");
                banner.createNotification("INGREDIENT UPDATED");
            }
        })
        .catch((err)=>{
            banner.createError("SOMETHING WENT WRONG, PLEASE REFRESH THE PAGE");
        })
        .finally(()=>{
            loader.style.display = "none";
        });
    }
}

module.exports = editIngredient;