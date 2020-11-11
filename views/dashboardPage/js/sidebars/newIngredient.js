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
        document.getElementById("submitFile").addEventListener("click", this.submitFile);
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
            quantity: quantityValue,
            defaultUnit: unit
        }

        //Change the ingredient if it is a special unit type (ie "bottle")
        if(unit === "bottle"){
            newIngredient.ingredient.unitType = "volume";
            newIngredient.ingredient.unitSize = document.getElementById("bottleSize").value;
            newIngredient.defaultUnit = document.getElementById("bottleUnits").value;
            newIngredient.ingredient.specialUnit = unit;
            newIngredient.quantity = quantityValue;
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
                    merchant.addIngredient(response.ingredient, response.quantity, response.defaultUnit);
                    controller.openStrand("ingredients");

                    banner.createNotification("INGREDIENT CREATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    submitFile: function(){
        const file = document.getElementById("ingredientFile").files[0];
        let data = new FormData();
        data.append("spreadsheet", file);

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/ingredients/create/spreadsheet", {
            method: "post",
            body: data,
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    for(let i = 0; i < response.length; i++){
                        merchant.addIngredient(response[i].ingredient, response[i].quantity, response[i].defaultUnit);

                        controller.openStrand("ingredients");
                    }
                }
                
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG.  TRY REFRESHING THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = newIngredient;