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
        if(controller.getUnitType(select.value) === "mass"){
            convertMass.style.display = "none";
            convertVolume.style.display = "flex";
            convertLength.style.display = "flex";
            document.getElementById("volumeConvertUnitLeft").innerText = select.value.toUpperCase();
            document.getElementById("lengthConvertUnitLeft").innerText = select.value.toUpperCase();
        }else if(controller.getUnitType(select.value) === "volume"){
            convertMass.style.display = "flex";
            convertVolume.style.display = "none";
            convertLength.style.display = "flex";
            document.getElementById("massConvertUnitLeft").innerText = select.value.toUpperCase();
            document.getElementById("lengthConvertUnitLeft").innerText = select.value.toUpperCase();
        }else if(controller.getUnitType(select.value) === "length"){
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

        let massConvertLeft = document.getElementById("massConvertLeft").value;
        let massConvertRight = document.getElementById("massConvertRight").value;
        let massConvertUnit = document.getElementById("massConvertUnitRight").value;
        let volumeConvertLeft = document.getElementById("volumeConvertLeft").value;
        let volumeConvertRight = document.getElementById("volumeConvertRight").value;
        let volumeConvertUnit = document.getElementById("volumeConvertUnitRight").value;
        let lengthConvertLeft = document.getElementById("lengthConvertLeft").value;
        let lengthConvertRight = document.getElementById("lengthConvertRight").value;
        let lengthConvertUnit = document.getElementById("lengthConvertUnitRight").value;

        let newIngredient = {
            ingredient: {
                name: document.getElementById("newIngName").value,
                category: document.getElementById("newIngCategory").value,
                unit: unit,
                convert: {
                    toMass: controller.baseUnit(massConvertRight, massConvertUnit) / controller.baseUnit(massConvertLeft, unit),
                    toVolume: controller.baseUnit(volumeConvertRight, volumeConvertUnit) / controller.baseUnit(volumeConvertLeft, unit),
                    toLength: controller.baseUnit(lengthConvertRight, lengthConvertUnit) / controller.baseUnit(lengthConvertLeft, unit)
                }
            },
            quantity: controller.baseUnit(quantityValue, unit)
        }

        if(isNaN(newIngredient.convert.toMass)) newIngredient.convert.toMass = undefined;
        if(isNaN(newIngredient.convert.toVolume)) newIngredient.convert.toVolume = undefined;
        if(isNaN(newIngredient.convert.toLength)) newIngredient.convert.toLength = undefined;
    
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