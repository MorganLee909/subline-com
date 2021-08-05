let editIngredient = {
    display: function(ingredient){
        let buttonList = document.getElementById("unitButtons");
        let quantLabel = document.getElementById("editIngQuantityLabel");
        let name = document.getElementById("editIngName");
        let unit = ingredient.ingredient.unit;

        name.focus();
        document.getElementById("editSubIngredients").onclick = ()=>{controller.openModal("editSubIngredients", ingredient.ingredient)};

        //Clear any existing data
        while(buttonList.children.length > 0){
            buttonList.removeChild(buttonList.firstChild);
        }

        //Populate basic fields
        name.innerText = ingredient.ingredient.name;
        document.getElementById("editIngName").value = ingredient.ingredient.name;
        document.getElementById("editIngCategory").value = ingredient.ingredient.category;
        quantLabel.innerText = `CURRENT STOCK (${unit.toUpperCase()})`;
        document.getElementById("editIngSubmit").onclick = ()=>{this.submit(ingredient)};

        //Populate the unit buttons
        let units = ingredient.ingredient.getPotentialUnits();
        let ingredientUnit = (unit === "bottle") ? ingredient.ingredient.altUnit : unit;
        for(let i = 0; i < units.length; i++){
            let button = document.createElement("button");
            button.classList.add("unitButton");
            button.innerText = units[i].toUpperCase();
            button.onclick = ()=>{this.changeUnit(button, ingredient)};
            buttonList.appendChild(button);
            
            if(units[i] === ingredientUnit) button.classList.add("unitActive");
        }

        //Offer conversions
        let massDiv = document.getElementById("editIngMass");
        let volumeDiv = document.getElementById("editIngVolume");
        let lengthDiv = document.getElementById("editIngLength");
        let multiplier = controller.unitMultiplier(controller.getBaseUnit(unit), unit);

        massDiv.children[0].value = 1;
        massDiv.children[1].innerText = (unit === "bottle") ? ingredient.ingredient.altUnit.toUpperCase() : unit.toUpperCase();
        massDiv.children[3].value = parseFloat((ingredient.ingredient.convert.toMass / multiplier).toFixed(3));
        massDiv.children[4].value = "g";
        massDiv.children[4].previousValue = "g";
        massDiv.children[4].onchange = ()=>{this.changeConversionSelect(massDiv)};

        volumeDiv.children[0].value = 1;
        volumeDiv.children[1].innerText = (unit === "bottle") ? ingredient.ingredient.altUnit.toUpperCase() : unit.toUpperCase();
        volumeDiv.children[3].value = parseFloat((ingredient.ingredient.convert.toVolume / multiplier).toFixed(3));
        volumeDiv.children[4].value = "l";
        volumeDiv.children[4].previousValue = "l";
        volumeDiv.children[4].onchange = ()=>{this.changeConversionSelect(volumeDiv)};

        lengthDiv.children[0].value = 1;
        lengthDiv.children[1].innerText = (unit === "bottle") ? ingredient.ingredient.altUnit.toUpperCase() : unit.toUpperCase();
        lengthDiv.children[3].value = parseFloat((ingredient.ingredient.convert.toLength / multiplier).toFixed(3));
        lengthDiv.children[4].value = "m";
        lengthDiv.children[4].value = "m";
        lengthDiv.children[4].onchange = ()=>{this.changeConversionSelect(lengthDiv)};

        switch(controller.getBaseUnit(unit)){
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

    changeUnit: function(button, ingredient){
        //update current stock quantity
        let label = document.getElementById("editIngQuantityLabel");
        if(ingredient.ingredient.unit !== "bottle") label.innerText = `CURRENT STOCK (${button.innerText})`;
        if(ingredient.ingredient.unit === "bottle") label.innerText = "CURRENT STOCK (bottle)";
        let input = document.createElement("input");
        input.id = "editIngQuantity";
        input.type = "number";
        input.min = "0";
        input.step = "0.01";
        input.value = (ingredient.quantity * controller.unitMultiplier(ingredient.ingredient.unit, button.innerText.toLowerCase())).toFixed(2);
        label.appendChild(input);
        
        //update conversions
        let massDiv = document.getElementById("editIngMass");
        let volumeDiv = document.getElementById("editIngVolume");
        let lengthDiv = document.getElementById("editIngLength");
        
        massDiv.children[1].innerText = button.innerText;
        volumeDiv.children[1].innerText = button.innerText;
        lengthDiv.children[1].innerText = button.innerText;
        let multiplier = controller.unitMultiplier(document.querySelector(".unitActive").innerText.toLowerCase(), button.innerText.toLowerCase());
    
        massDiv.children[0].value = parseFloat((massDiv.children[0].value * multiplier).toFixed(3));
        massDiv.children[3].value = parseFloat((massDiv.children[3].value * multiplier).toFixed(3));
        volumeDiv.children[0].value = parseFloat((volumeDiv.children[0].value * multiplier).toFixed(3));
        volumeDiv.children[3].value = parseFloat((volumeDiv.children[3].value * multiplier).toFixed(3));
        lengthDiv.children[0].value = parseFloat((lengthDiv.children[0].value * multiplier).toFixed(3));
        lengthDiv.children[3].value = parseFloat((lengthDiv.children[3].value *= multiplier).toFixed(3));

        //Update the buttons
        let buttons = document.getElementById("unitButtons");

        for(let i = 0; i < buttons.children.length; i++){
            buttons.children[i].classList.remove("unitActive");
        }

        button.classList.add("unitActive");
    },

    changeConversionSelect: function(div){
        let multiplier = controller.unitMultiplier(div.children[4].previousUnit, div.children[4].value);
        div.children[3].value = parseFloat((div.children[3].value * multiplier).toFixed(3));
        div.children[4].previousUnit = div.children[4].value;
    },

    submit: function(ingredient){
        let quantity = parseFloat(document.getElementById("editIngQuantityLabel").children[0].value);
        let selectedUnit = document.getElementById("unitButtons").querySelector(".unitActive").innerText.toLowerCase();
        let unit = (ingredient.ingredient.unit === "bottle") ? "bottle" : selectedUnit;

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
        let rightUnitVolume = volumeDiv.children[4].value;
        let rightUnitLength = lengthDiv.children[4].value;
        let leftMultiplier = controller.unitMultiplier(leftUnit, controller.getBaseUnit(leftUnit));

        leftMass *= leftMultiplier;
        leftVolume *= leftMultiplier;
        leftLength *= leftMultiplier;
        rightMass *= controller.unitMultiplier(rightUnitMass, controller.getBaseUnit(rightUnitMass));
        rightVolume *= controller.unitMultiplier(rightUnitVolume, controller.getBaseUnit(rightUnitVolume));
        rightLength *= controller.unitMultiplier(rightUnitLength, controller.getBaseUnit(rightUnitLength));

        console.log(quantity);
        let data = {
            ingredient: {
                id: ingredient.ingredient.id,
                name: document.getElementById("editIngName").value,
                category: document.getElementById("editIngCategory").value,
                unit: unit,
                convert: {
                    toMass: rightMass / leftMass,
                    toVolume: rightVolume / leftVolume,
                    toLength: rightLength / leftLength
                }
            },
            quantity: quantity * controller.unitMultiplier(unit, controller.getBaseUnit(unit))
        };

        switch(controller.getUnitType(unit)){
            case "mass": data.ingredient.convert.toMass = 1; break;
            case "volume": data.ingredient.convert.toVolume = 1; break;
            case "length": data.ingredient.convert.toLength = 1; break;
            case "bottle":
                data.quantity = quantity / data.ingredient.convert.toVolume;
                // data.ingredient.convert.toMass = 1 / controller.toBase(rightMass / leftMass);
                data.ingredient.convert.toVolume = ingredient.ingredient.convert.toVolume;
                // data.ingredient.convert.toLength = 1 / controller.toBase(rightLength / leftLength);
                data.ingredient.altUnit = selectedUnit;
                break;
        }
        console.log(data);

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