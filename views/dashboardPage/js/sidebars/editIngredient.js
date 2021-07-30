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

        //Populate the unit buttons
        const units = ingredient.ingredient.getPotentialUnits();

        for(let i = 0; i < units.length; i++){
            let button = document.createElement("button");
            button.classList.add("unitButton");
            button.innerText = units[i].toUpperCase();
            button.onclick = ()=>{this.changeUnit(button)};
            buttonList.appendChild(button);
            
            if(units[i] === ingredient.unit) button.classList.add("unitActive");
        }

        //Offer conversions
        let massDiv = document.getElementById("editIngMass");
        let volumeDiv = document.getElementById("editIngVolume");
        let lengthDiv = document.getElementById("editIngLength");

        massDiv.children[1].innerText = ingredient.unit.toUpperCase();
        massDiv.children[3].innerText = ingredient.ingredient.convert.toMass;

        volumeDiv.children[1].innerText = ingredient.unit.toUpperCase();
        volumeDiv.children[3].innerText = ingredient.ingredient.convert.toVolume;

        lengthDiv.children[1].innerText = ingredient.unit.toUpperCase();
        lengthDiv.children[3].innerText = ingredient.ingredient.convert.toLength;

        switch(controller.getBaseUnit(ingredient.unit)){
            case "g": 
                massDiv.style.display = "none";
                volumeDiv.style.display = "flex";
                lengthDiv.style.display = "flex";
                break;
            case "l":
                massDiv.style.display = "flex";
                volumeDiv.style.display = "none";
                lengthDiv.style.display = "flex";
                break;
            case "m":
                massDiv.style.display = "flex";
                volumeDiv.style.display = "flex";
                lengthDiv.style.display = "none";
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

        document.getElementById("editIngMass").children[1].innerText = button.innerText;
        document.getElementById("editIngVolume").children[1].innerText = button.innerText;
        document.getElementById("editIngLength").children[1].innerText = button.innerText;
    },

    submit(ingredient){
        let quantity = parseFloat(document.getElementById("editIngQuantityLabel").children[0].value);
        let unit = document.getElementById("unitButtons").querySelector(".unitActive").innerText.toLowerCase();

        let massDiv = document.getElementById("editIngMass");
        let volumeDiv = document.getElementById("editIngVolume");
        let lengthDiv = document.getElementById("editIngLength");

        let leftMass = massDiv.children[0].value;
        let rightMass = massDiv.children[3].value;
        let leftVolume = volumeDiv.children[0].value;
        let rightVolume = volumeDiv.children[3].value;
        let leftLength = lengthDiv.children[0].value;
        let rightLength = lengthDiv.children[3].value;
        let leftUnit = massDiv.children[1].innerText.toLowerCase();
        let rightUnitMass = massDiv.children[4].value;
        let rightUnitVolume = massDiv.children[4].value;
        let rightUnitLength = massDivchildren[4].value;
        let leftMultiplier = controller.unitMultiplier(leftUnit, controller.getBaseUnit(leftUnit));

        leftMass *= leftMultiplier;
        leftVolume *= leftMultiplier;
        leftLength *= leftMultiplier;
        rightMass *= controller.unitMultiplier(rightUnitMass, controller.getBaseUnit(rightUnitMass));
        rightVolume *= controller.unitMultiplier(rightUnitVolume, controller.getBaseUnit(rightUnitVolume));
        rightLength *= controller.unitMultiplier(rightUnitLength, controller.getBaseUnit(rightUnitLength));

        let data = {
            ingredient: {
                id: ingredient.ingredient.id,
                name: document.getElementById("editIngName").value,
                category: document.getElementById("editIngCategory").value,
                unit: unit,
                convert: {
                    toMass: rightMass / leftMass,
                    toVolume: rigthVolume / leftVolume,
                    toLength: rightLength / leftLength
                }
            },
            quantity: quantity * controller.unitMultiplier(unit, controller.getBaseUnit(unit))
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
                controller.createBanner(response, "error");
            }else{
                merchant.updateIngredients([response]);
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