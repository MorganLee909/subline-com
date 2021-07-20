let newIngredient = {
    display: function(){
        const selector = document.getElementById("unitSelector");

        document.getElementById("newIngName").placeholder = "NAME";
        document.getElementById("newIngCategory").placeholder = "CATEGORY";
        document.getElementById("newIngQuantity").placeholder = "QUANTITY";
        document.getElementById("bottleSizeLabel").style.display = "none";
        document.getElementById("volumeConvertUnitLeft").innerText = "G";
        document.getElementById("lengthConvertUnitLeft").innerText = "G";
        selector.value = "g";

        selector.onchange = ()=>{this.unitChange()};
        document.getElementById("submitNewIng").onclick = ()=>{this.submit()};
    },

    unitChange: function(){
        const select = document.getElementById("unitSelector");
        const bottleLabel = document.getElementById("bottleSizeLabel");
        if(select.value === "bottle"){
            bottleLabel.style.display = "block";
        }else{
            bottleLabel.style.display = "none";
        }

        let convertMass = document.getElementById("newIngMassConvert");
        let convertVolume = document.getElementById("newIngVolumeConvert");
        let convertLength = document.getElementById("newIngLengthConvert");
        if(["g", "kg", "oz", "lb"].includes(select.value)){
            convertMass.style.display = "none";
            convertVolume.style.display = "flex";
            convertLength.style.display = "flex";
            document.getElementById("volumeConvertUnitLeft").innerText = select.value.toUpperCase();
            document.getElementById("lengthConvertUnitLeft").innerText = select.value.toUpperCase();
        }else if(["ml", "l", "tsp", "tbsp", "ozfl", "cup", "pt", "qt", "gal"].includes(select.value)){
            convertMass.style.display = "flex";
            convertVolume.style.display = "none";
            convertLength.style.display = "flex";
            document.getElementById("massConvertUnitLeft").innerText = select.value.toUpperCase();
            document.getElementById("lengthConvertUnitLeft").innerText = select.value.toUpperCase();
        }else if(["mm", "cm", "m", "in", "ft"].includes(select.value)){
            convertMass.style.display = "flex";
            convertVolume.style.display = "flex";
            convertLength.style.display = "none";
            document.getElementById("massConvertUnitLeft").innerText = select.value.toUpperCase();
            document.getElementById("volumeConvertUnitLeft").innerText = select.value.toUpperCase();
        }
    },

    submit: function(){
        let unitSelector = document.getElementById("unitSelector");
        let options = document.querySelectorAll("#unitSelector option");
        const quantityValue = parseFloat(document.getElementById("newIngQuantity").value);

        let unit = unitSelector.value;

        let newIngredient = {
            ingredient: {
                name: document.getElementById("newIngName").value,
                category: document.getElementById("newIngCategory").value,
                unitType: options[unitSelector.selectedIndex].getAttribute("type")
            },
            quantity: controller.baseUnit(quantityValue, unit),
            defaultUnit: unit
        }

        switch(newIngredient.ingredient.unitType){
            case "mass": newIngredient.ingredient.toMass = 1; break;
            case "volume": newIngredient.ingredient.toVolume = 1; break;
            case "length": newIngredient.ingredient.toLength = 1; break;
        }

        //Change the ingredient if it is a special unit type (ie "bottle")
        if(unit === "bottle"){
            newIngredient.ingredient.unitType = document.getElementById("bottleUnits").value;
            newIngredient.ingredient.unitSize = controller.baseUnit(parseFloat(document.getElementById("bottleSize").value), unit);
        }
    
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/ingredients/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newIngredient)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    merchant.addIngredients([response]);
                    state.updateIngredients();
                    controller.openStrand("ingredients");

                    controller.createBanner("INGREDIENT CREATED", "success");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    submitSpreadsheet: function(){
        event.preventDefault();
        controller.closeModal();

        const file = document.getElementById("spreadsheetInput").files[0];
        let data = new FormData();
        data.append("ingredients", file);

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/ingredients/create/spreadsheet", {
            method: "post",
            body: data
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    merchant.addIngredients(response);
                    state.updateIngredients();

                    controller.createBanner("INGREDIENTS SUCCESSFULLY ADDED", "success");
                    controller.openStrand("ingredients");
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

module.exports = newIngredient;