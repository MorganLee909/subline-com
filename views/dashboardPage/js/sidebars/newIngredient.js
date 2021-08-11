let newIngredient = {
    display: function(){
        let selector = document.getElementById("unitSelector");
        let name = document.getElementById("newIngName");

        name.focus();
        name.placeholder = "NAME";
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
        let select = document.getElementById("unitSelector");
        let bottleLabel = document.getElementById("bottleSizeLabel");
        if(select.value === "bottle"){
            bottleLabel.style.display = "block";
        }else{
            bottleLabel.style.display = "none";
        }

        let convertMass = document.getElementById("newIngMassConvert");
        let convertVolume = document.getElementById("newIngVolumeConvert");
        let convertLength = document.getElementById("newIngLengthConvert");

        let massLeft = document.getElementById("massConvertUnitLeft");
        let volumeLeft = document.getElementById("volumeConvertUnitLeft");
        let lengthLeft = document.getElementById("lengthConvertUnitLeft");
        if(controller.getUnitType(select.value) === "mass"){
            convertMass.style.display = "none";
            convertVolume.style.display = "flex";
            convertLength.style.display = "flex";
            volumeLeft.innerText = select.value.toUpperCase();
            lengthLeft.innerText = select.value.toUpperCase();
        }else if(controller.getUnitType(select.value) === "volume"){
            convertMass.style.display = "flex";
            convertVolume.style.display = "none";
            convertLength.style.display = "flex";
            massLeft.innerText = select.value.toUpperCase();
            lengthLeft.innerText = select.value.toUpperCase();
        }else if(controller.getUnitType(select.value) === "length"){
            convertMass.style.display = "flex";
            convertVolume.style.display = "flex";
            convertLength.style.display = "none";
            massLeft.innerText = select.value.toUpperCase();
            volumeLeft.innerText = select.value.toUpperCase();
        }else if(select.value === "bottle"){
            convertMass.style.display ="flex";
            convertVolume.style.display = "none";
            convertLength.style.display = "flex";
            massLeft.innerText = "ML";
            lengthLeft.innerText = "ML";
            let bottleSelect = document.getElementById("bottleUnits");
            bottleSelect.onchange = ()=>{
                massLeft.innerText = bottleSelect.value.toUpperCase();
                lengthLeft.innerText = bottleSelect.value.toUpperCase();
            }
        }
    },

    submit: function(){
        let unitSelector = document.getElementById("unitSelector");
        let quantityValue = parseFloat(document.getElementById("newIngQuantity").value);

        let unit = unitSelector.value;

        let massDiv = document.getElementById("newIngMassConvert");
        let volumeDiv = document.getElementById("newIngVolumeConvert");
        let lengthDiv = document.getElementById("newIngLengthConvert");

        let massLeft = controller.toBase(massDiv.children[0].value, unit)
        let massRight = controller.toBase(massDiv.children[3].value, massDiv.children[4].value);
        let volumeLeft = controller.toBase(volumeDiv.children[0].value, unit)
        let volumeRight = controller.toBase(volumeDiv.children[3].value, volumeDiv.children[4].value);
        let lengthLeft = controller.toBase(lengthDiv.children[0].value, unit)
        let lengthRight = controller.toBase(lengthDiv.children[3].value, lengthDiv.children[4].value);

        let newIngredient = {
            ingredient: {
                name: document.getElementById("newIngName").value,
                category: document.getElementById("newIngCategory").value,
                unit: unit,
                convert: {
                    toMass: massRight / massLeft,
                    toVolume: volumeRight / volumeLeft,
                    toLength: lengthRight / lengthLeft
                }
            },
            quantity: controller.baseUnit(quantityValue, unit)
        };

        if(isNaN(newIngredient.ingredient.convert.toMass)) newIngredient.ingredient.convert.toMass = 0;
        if(isNaN(newIngredient.ingredient.convert.toVolume)) newIngredient.ingredient.convert.toVolume = 0;
        if(isNaN(newIngredient.ingredient.convert.toLength)) newIngredient.ingredient.convert.toLength = 0;

        let convert = newIngredient.ingredient.convert;
        switch(controller.getUnitType(unit)){
            case "mass": newIngredient.ingredient.convert.toMass = 1; break;
            case "volume": newIngredient.ingredient.convert.toVolume = 1; break;
            case "length": newIngredient.ingredient.convert.toLength = 1; break;
            // case "mass": convert.toMass = controller.unitMultiplier(unit, "g"); break;
            // case "volume": convert.toVolume = controller.unitMultiplier(unit, "l"); break;
            // case "length": convert.toLength = controller.unitMultiplier(unit, "m"); break;
            case "bottle": 
                let bottleQuant = document.getElementById("bottleSize").value;
                let bottleUnit = document.getElementById("bottleUnits").value;
                newIngredient.ingredient.convert.toVolume = 1 / controller.toBase(bottleQuant, bottleUnit);
                newIngredient.quantity = quantityValue * controller.toBase(bottleQuant, bottleUnit);
                newIngredient.ingredient.altUnit = bottleUnit;
                break;
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
    }
}

module.exports = newIngredient;