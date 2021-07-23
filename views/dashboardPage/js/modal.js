const Merchant = require("./classes/Merchant.js");

let modal = {
    feedback: function(){
        let form = document.getElementById("modalFeedback");
        form.style.display = "flex";
        form.onsubmit = ()=>{this.submitFeedback()};
    },

    submitFeedback: function(){
        event.preventDefault();

        let data = {
            title: document.getElementById("feedbackTitle").value,
            content: document.getElementById("feedbackContent").value,
            date: new Date()
        };

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/feedback", {
            method: "post",
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
                    controller.createBanner("THANK YOU FOR YOUR INPUT", "success");
                    controller.closeModal();
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    newMerchant: function(){
        let form = document.getElementById("modalNewMerchant");
        form.style.display = "flex";
        form.onsubmit = ()=>{this.submitNewMerchantNone()};
    },

    submitNewMerchantNone(){
        event.preventDefault();

        let data = {
            name: document.getElementById("addMerchantName").value,
        };

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/merchant/add/none", {
            method: "post",
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
                    let newMerchant = new Merchant(
                        response[1].name,
                        response[1].pos,
                        response[1].inventory,
                        response[1].recipes,
                        [],
                        (response[1].address === undefined) ? "" : response[1].address.full,
                        response[0]
                    );

                    window.merchant = newMerchant;

                    state.updateMerchant();
                    controller.openStrand("home");
                    controller.closeModal();
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    squareLocations: function(locations){
        document.getElementById("modalSquareLocations").style.display = "flex";
        document.getElementById("squareLocationsCancel").onclick = ()=>{controller.closeModal()};
        if(locations.length === 0){
            document.getElementById("squareLocationsTitle").innerText = "ALL OF YOUR LOCATIONS HAVE ALREADY BEEN ADDED TO THE SUBLINE";
            return;
        }

        let container = document.getElementById("squareLocationsButtons");

        while(container.children.length > 0){
            container.removeChild(container.firstChild);
        }
        
        for(let i = 0; i < locations.length; i++){
            let button = document.createElement("button");
            button.innerText = locations[i].name;
            button.classList.add("button");
            button.onclick = ()=>{this.addSquareMerchant(locations[i].id)};
            container.appendChild(button);
        }
    },

    addSquareMerchant: function(id){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/square/add/${id}`)
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    window.merchant = new Merchant(
                        response[1].name,
                        response[1].pos,
                        response[1].inventory,
                        response[1].recipes,
                        [],
                        (response[1].address === undefined) ? "" : response[1].address.full,
                        response[0]
                    );

                    state.updateMerchant();
                    controller.closeModal();
                    controller.openStrand("home");
                    controller.createBanner(`NEW MERCHANT, "${response[1].name}", CREATED`, "success");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    editSubIngredients: function(ingredient){
        document.getElementById("modalEditSubIngredients").style.display = "flex";

        document.getElementById("cancelEditSubIngredients").onclick = ()=>{controller.closeModal()};

        let left = document.getElementById("editSubAllIng");
        let right = document.getElementById("editSubCurrentIng");
        let template = document.getElementById("selectedSubIngredient").content.children[0];

        while(left.children.length > 0){
            left.removeChild(left.firstChild);
        }

        while(right.children.length > 0){
            right.removeChild(right.firstChild);
        }
        
        let createOptGroup = (container, group, options)=>{
            let optGroup = document.createElement("optgroup")
            optGroup.label = group;
            container.appendChild(optGroup);

            for(let i = 0; i < options.length; i++){
                let option = document.createElement("option");
                option.innerText = options[i].toUpperCase();
                option.value = options[i];
                optGroup.appendChild(option);
            }
        }

        let addIngredient = (button, newIngredient)=>{
            button.parentElement.removeChild(button);

            let div = template.cloneNode(true);
            div.children[0].children[0].innerText = newIngredient.name;
            div.children[0].children[1].onclick = ()=>{removeIngredient(div, newIngredient)};
            div.children[1].children[0].children[0].value = 1;
            div.children[1].children[2].children[0].value = 1;
            div.ingredient = newIngredient;
            right.appendChild(div);

            if(newIngredient.convert.toMass !== undefined){
                createOptGroup(div.children[1].children[0].children[1], "Mass", ["g", "kg", "oz", "lb"])
            }
            if(newIngredient.convert.toVolume !== undefined){
                createOptGroup(div.children[1].children[0].children[1], "Volume", ["ml", "l", "tsp", "tbsp", "ozfl", "cup", "pt", "qt", "gal"]);
            }
            if(newIngredient.convert.toLength !== undefined){
                createOptGroup(div.children[1].children[0].children[1], "Length", ["mm", "cm", "m", "in", "ft"]);
            }
            div.children[1].children[0].children[1].value = newIngredient.unit;

            createOptGroup(
                div.children[1].children[2].children[1],
                ingredient.unitType,
                ingredient.getPotentialUnits()    
            );
            div.children[1].children[2].children[1].value = ingredient.unit;
        }

        let removeIngredient = (div, newIngredient)=>{
            div.parentElement.removeChild(div);

            let button = document.createElement("button");
            button.innerText = newIngredient.name;
            button.classList.add("choosable");
            button.onclick = ()=>{addIngredient(button, newIngredient)};
            left.appendChild(button);
        }

        for(let i = 0; i < merchant.inventory.length; i++){
            if(ingredient.id === merchant.inventory[i].ingredient.id) continue;
            let skip = false;
            for(let j = 0; j < ingredient.subIngredients.length; j++){
                if(merchant.inventory[i].ingredient === ingredient.subIngredients[j].ingredient){
                    let div = template.cloneNode(true);
                    div.children[0].children[0].innerText = merchant.inventory[i].ingredient.name;
                    div.children[0].children[1].onclick = ()=>{removeIngredient(div, ingredient.subIngredients[j].ingredient)};
                    div.children[1].children[0].children[0].value = ingredient.subIngredients[j].quantity;
                    div.children[1].children[2].children[0].value = 1;
                    div.ingredient = merchant.inventory[i].ingredient;
                    right.appendChild(div);

                    let conversions = merchant.inventory[i].ingredient.convert;
                    if(conversions.toMass !== undefined){
                        createOptGroup(div.children[1].children[0].children[1], "Mass", ["g", "kg", "oz", "lb"]);
                    }
                    if(conversions.toVolume !== undefined){
                        createOptGroup(div.children[1].children[0].children[1], "Volume", ["ml", "l", "tsp", "tbsp", "ozfl", "cup", "pt", "qt", "gal"]);
                    }
                    if(conversions.toLength !== undefined){
                        createOptGroup(div.children[1].children[0].children[1], "Length", ["mm", "cm", "m", "in", "ft"]);
                    }
                    div.children[1].children[0].children[1].value = merchant.inventory[i].ingredient.unit;

                    createOptGroup(
                        div.children[1].children[2].children[1],
                        ingredient.unitType,
                        ingredient.getPotentialUnits()    
                    );
                    div.children[1].children[2].children[1].value = merchant.inventory[i].ingredient.unit;

                    skip = true;
                    break;
                }
            }
            if(skip === true) continue;

            let button = document.createElement("button");
            button.innerText = merchant.inventory[i].ingredient.name;
            button.classList.add("choosable");
            button.onclick = ()=>{addIngredient(button, merchant.inventory[i].ingredient)};
            left.appendChild(button);
        }

        //SUBMIT SUB INGREDIENTS
        document.getElementById("submitEditSubIngredients").onclick = ()=>{
            let data = {
                id: ingredient.id,
                ingredients: []
            };

            for(let i = 0; i < right.children.length; i++){
                let leftQuantity = parseFloat(right.children[i].children[1].children[0].children[0].value);
                let leftUnit = right.children[i].children[1].children[0].children[1].value;
                let rightQuantity = parseFloat(right.children[i].children[1].children[2].children[0].value);
                let rightUnit = right.children[i].children[1].children[2].children[1].value;

                let rightBase = controller.baseUnit(rightQuantity, rightUnit);

                data.ingredients.push({
                    ingredient: right.children[i].ingredient.id,
                    quantity: leftQuantity / rightBase,
                    unit: leftUnit
                });
            }

            let loader = document.getElementById("loaderContainer");
            loader.style.display = "flex";

            fetch("/ingredients/subingredients", {
                method: "put",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        if(response.includes("$") === true) {
                            controller.createBanner(response.split("$")[0], "error");
                            controller.closeModal();
                            controller.openModal("circularReference", response);
                        }else{
                            controller.createBanner(response, "error");
                        }
                    }else{
                        ingredient.replaceIngredients(response.ingredients);
                        state.updateIngredients();

                        controller.createBanner(`SUB-INGREDIENTS UPDATED FOR ${ingredient.name}`, "success");
                        controller.closeModal();
                    }
                })
                .catch((err)=>{
                    controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
                })
                .finally(()=>{
                    loader.style.display = "none";
                });
        }
    },

    circularReference: function(response){
        let array = response.split("$");

        let modal = document.getElementById("modalCircularReference");
        modal.style.display = "flex";

        modal.children[0].innerText = array[0];

        while(modal.children[1].children.length > 0){
            modal.children[1].removeChild(modal.children[1].firstChild);
        }

        for(let i = 1; i < array.length; i++){
            let text = document.createElement("p");
            text.innerText = array[i];
            modal.children[1].appendChild(text);
        }

        document.getElementById("circularReferenceButton").onclick = ()=>{controller.closeModal()};
    },

    alternateUnit: function(data){
        document.getElementById("modalUnitConversion").style.display = "flex";
        let container = document.getElementById("unitConversions");
        let template = document.getElementById("convertUnitOption").content.children[0];

        while(container.children.length > 0){
            container.removeChild(container.firstChild);
        }

        for(let i = 0; i < data.mismatchUnits.length; i++){
            let conversion = template.cloneNode(true);
            conversion.children[0].innerText = data.mismatchUnits[i].ingredient.name;
            conversion.children[1].children[0].children[0].value = data.mismatchUnits[i].newIngredient.quantity;
            conversion.children[1].children[0].children[1].innerText = data.mismatchUnits[i].newIngredient.unit.toUpperCase();
            conversion.children[1].children[2].children[1].innerText = data.mismatchUnits[i].ingredient.unit.toUpperCase();
            container.appendChild(conversion);
        }

        //Submit conversions
        document.getElementById("submitAlternateUnits").onclick = ()=>{
            for(let i = 0; i < container.children.length; i++){
                let inputLeft = container.children[i].children[1].children[0].children[0].value;
                let inputRight = container.children[i].children[1].children[2].children[0].value;
                if(inputLeft === "" || inputRight === "" || inputLeft === 0 || inputRight === 0){
                    controller.createBanner("ALL FIELDS ARE REQUIRED", "error");
                    return;
                }

                data.mismatchUnits[i].newIngredient.baseUnitMultiplier = data.mismatchUnits[i].ingredient.calculateRecipeMultiplier(inputLeft, inputRight);
            }

            controller.closeModal();
            data.submit(data.recipe);
        }
    }
};

module.exports = modal;