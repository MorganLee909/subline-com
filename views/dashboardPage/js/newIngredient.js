let newIngredient = {
    display: function(Ingredient){
        const selector = document.getElementById("unitSelector");

        document.getElementById("newIngName").value = "";
        document.getElementById("newIngCategory").value = "";
        document.getElementById("newIngQuantity").value = 0;
        document.getElementById("bottleSizeLabel").style.display = "none";
        selector.value = "g";

        selector.onchange = ()=>{this.unitChange()};
        document.getElementById("submitNewIng").onclick = ()=>{this.submit(Ingredient)};
    },

    unitChange: function(){
        const select = document.getElementById("unitSelector");
        const bottleLabel = document.getElementById("bottleSizeLabel");
        if(select.value === "bottle"){
            bottleLabel.style.display = "block";
        }else{
            bottleLabel.style.display = "none";
        }
    },

    submit: function(Ingredient){
        let unitSelector = document.getElementById("unitSelector");
        let options = document.querySelectorAll("#unitSelector option");
        const quantityValue = document.getElementById("newIngQuantity").value;

        let unit = unitSelector.value;

        let newIngredient = {
            ingredient: {
                name: document.getElementById("newIngName").value,
                category: document.getElementById("newIngCategory").value,
                unitType: options[unitSelector.selectedIndex].getAttribute("type"),
            },
            quantity: controller.convertToMain(unit, quantityValue),
            defaultUnit: unit
        }

        //Change the ingredient if it is a special unit type (ie "bottle")
        if(unit === "bottle"){
            const bottleUnit = document.getElementById("bottleUnits").value;
            const bottleSize = controller.convertToMain(bottleUnit, document.getElementById("bottleSize").value);

            newIngredient.ingredient.unitType = "volume";
            newIngredient.ingredient.unitSize = bottleSize;
            newIngredient.defaultUnit = bottleUnit;
            newIngredient.ingredient.specialUnit = unit;
            newIngredient.quantity = quantityValue * bottleSize;
        }
    
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/ingredients/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(newIngredient)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.editIngredients([{
                        ingredient: new Ingredient(
                            response.ingredient._id,
                            response.ingredient.name,
                            response.ingredient.category,
                            response.ingredient.unitType,
                            response.defaultUnit,
                            merchant,
                            response.ingredient.specialUnit,
                            response.ingredient.unitSize
                        ),
                        quantity: response.quantity
                    }]);

                    banner.createNotification("INGREDIENT CREATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = newIngredient;