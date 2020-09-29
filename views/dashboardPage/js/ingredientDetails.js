let ingredientDetails = {
    ingredient: {},
    dailyUse: 0,

    display: function(ingredient){
        this.ingredient = ingredient;

        if(this.ingredient.ingredient.specialUnit === "bottle"){
            try{
                let label = document.getElementById("ingredientUnitSizeLabel");
                label.parentElement.removeChild(label);

                let border = document.getElementById("bottleBorder");
                border.parentElement.removeChild(border);
            }catch(err){}
        }

        document.getElementById("ingredientDetailsCategory").innerText = ingredient.ingredient.category;

        let categoryInput = document.getElementById("detailsCategoryInput");
        categoryInput.value = "";
        categoryInput.placeholder = ingredient.ingredient.category;

        document.getElementById("ingredientDetailsName").innerText = ingredient.ingredient.name;
        
        let nameInput = document.getElementById("ingredientDetailsNameIn");
        nameInput.value = "";
        nameInput.placeholder = ingredient.ingredient.name;

        //Display the stock quantity (and the edit input) based on the unit type
        let stockInput = document.getElementById("ingredientInput");
        let stockDisplay = document.getElementById("ingredientStock");
        stockInput.value = "";
        if(ingredient.ingredient.specialUnit === "bottle"){
            let quantity = ingredient.ingredient.convert(ingredient.quantity);

            stockDisplay.innerText = `${quantity.toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;
            stockDisplay.innerText = `${(ingredient.quantity / ingredient.ingredient.unitSize).toFixed(2)} BOTTLES`;
            stockInput.placeholder = quantity.toFixed(2);
        }else{
            stockDisplay.innerText = `${ingredient.ingredient.convert(ingredient.quantity).toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;
            stockInput.placeholder = ingredient.ingredient.convert(ingredient.quantity).toFixed(2);
        }


        let quantities = [];
        let now = new Date();
        for(let i = 1; i < 31; i++){
            let endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
            let startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i - 1);

            quantities.push(merchant.getSingleIngredientSold(startDay, endDay, ingredient));
        }

        let sum = 0;
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
        }

        let dailyUse = sum / quantities.length;
        document.getElementById("dailyUse").innerText = `${ingredient.ingredient.convert(dailyUse).toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;

        let ul = document.getElementById("ingredientRecipeList");
        let recipes = merchant.getRecipesForIngredient(ingredient.ingredient);
        while(ul.children.length > 0){
            ul.removeChild(ul.firstChild);
        }
        for(let i = 0; i < recipes.length; i++){
            let li = document.createElement("li");
            li.innerText = recipes[i].name;
            li.onclick = ()=>{
                controller.openStrand("recipeBook");
                controller.openSidebar("recipeDetails", recipes[i]);
            }
            ul.appendChild(li);
        }

        let ingredientButtons = document.getElementById("ingredientButtons");
        let units = [];
        if(this.ingredient.ingredient.unitType !== "other"){
            units = merchant.units[this.ingredient.ingredient.unitType];
        }
        while(ingredientButtons.children.length > 0){
            ingredientButtons.removeChild(ingredientButtons.firstChild);
        }
        for(let i = 0; i < units.length; i++){
            let button = document.createElement("button");
            button.classList.add("unitButton");
            button.innerText = units[i].toUpperCase();
            button.onclick = ()=>{this.changeUnit(button, units[i])};
            ingredientButtons.appendChild(button);

            if(units[i] === this.ingredient.ingredient.unit){
                button.classList.add("unitActive");
            }
        }

        let add = document.querySelectorAll(".editAdd");
        let remove = document.querySelectorAll(".editRemove");

        for(let i = 0; i < add.length; i++){
            add[i].style.display = "none";
        }

        for(let i = 0; i < remove.length; i++){
            remove[i].style.display = "block";
        }

        document.getElementById("editSubmitButton").onclick = ()=>{this.editSubmit()};
        document.getElementById("editCancelButton").onclick = ()=>{this.display(this.ingredient)};
        document.getElementById("editIngBtn").onclick = ()=>{this.edit()};
        document.getElementById("removeIngBtn").onclick = ()=>{this.remove()};
    },

    remove: function(){
        for(let i = 0; i < merchant.recipes.length; i++){
            for(let j = 0; j < merchant.recipes[i].ingredients.length; j++){
                if(this.ingredient.ingredient === merchant.recipes[i].ingredients[j].ingredient){
                    banner.createError("MUST REMOVE INGREDIENT FROM ALL RECIPES BEFORE REMOVING FROM INVENTORY");
                    return;
                }
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/ingredients/remove/${this.ingredient.ingredient.id}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.removeIngredient(this.ingredient);
                    banner.createNotification("INGREDIENT REMOVED");
                }
            })
            .catch((err)=>{})
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    edit: function(){
        let add = document.querySelectorAll(".editAdd");
        let remove = document.querySelectorAll(".editRemove");

        for(let i = 0; i < add.length; i++){
            add[i].style.display = "flex";
        }

        for(let i = 0; i < remove.length; i++){
            remove[i].style.display = "none";
        }

        if(this.ingredient.ingredient.specialUnit === "bottle"){
            const mainDiv = document.getElementById("ingredientDetails");
            const displayUnits = document.getElementById("displayUnitLabel");

            let label = document.createElement("label");
            label.innerText = `BOTTLE SIZE (${this.ingredient.ingredient.unit.toUpperCase()})`;
            label.id = "ingredientUnitSizeLabel";
            mainDiv.insertBefore(label, displayUnits);

            const convQuant = this.ingredient.ingredient.convert(this.ingredient.ingredient.unitSize);

            let input = document.createElement("input");
            input.type = "number";
            input.value = convQuant.toFixed(2);
            input.id = "ingredientUnitSizeIn";
            input.min = "0";
            input.step = "0.01";
            label.appendChild(input);

            let border = document.createElement("div");
            border.classList.add("lineBorder");
            border.id="bottleBorder";
            mainDiv.insertBefore(border, displayUnits);
        }
    },

    editSubmit: function(){
        //Update the ingredient unit depending on the type of unit
        let ingredientButtons = document.querySelectorAll(".unitButton");
        for(let i = 0; i < ingredientButtons.length; i++){
            if(ingredientButtons[i].classList.contains("unitActive")){
                const unit = ingredientButtons[i].innerText.toLowerCase();
                this.ingredient.ingredient.unit = unit;

                break;
            }
        }

        //Update the ingredient quantity depending on the type of unit
        const quantityElem = document.getElementById("ingredientInput");
        if(quantityElem.value !== ""){
            if(this.ingredient.ingredient.specialUnit === "bottle"){
                let quantInMain = controller.convertToMain(
                    this.ingredient.ingredient.unit,
                    quantityElem.value * this.ingredient.ingredient.unitSize
                );

                this.ingredient.quantity = quantInMain / this.ingredient.ingredient.unitSize;
            }else{
                this.ingredient.quantity = controller.convertToMain(
                    this.ingredient.ingredient.unit,
                    Number(quantityElem.value)
                );
            }
        }

        const category = document.getElementById("detailsCategoryInput");
        this.ingredient.ingredient.category = (category.value === "") ? this.ingredient.ingredient.category : category.value;

        const name = document.getElementById("ingredientDetailsNameIn");
        this.ingredient.ingredient.name = (name.value === "") ? this.ingredient.ingredient.name : name.value;

        let data = {
            id: this.ingredient.ingredient.id,
            name: this.ingredient.ingredient.name,
            quantity: this.ingredient.quantity,
            category: this.ingredient.ingredient.category,
            defaultUnit: this.ingredient.ingredient.unit
        };

        if(this.ingredient.ingredient.specialUnit === "bottle"){
            const unitSize = document.getElementById("ingredientUnitSizeIn").value;
            this.ingredient.ingredient.unitSize = controller.convertToMain(this.ingredient.ingredient.unit, unitSize);
            data.unitSize = this.ingredient.ingredient.unitSize;
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/ingredients/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.updateIngredient(this.ingredient, this.ingredient.quantity);
                    //ingredient updates

                    this.display(this.ingredient);

                    banner.createNotification("INGREDIENT UPDATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    changeUnit: function(newActive, unit){
        let ingredientButtons = document.querySelectorAll(".unitButton");
        for(let i = 0; i < ingredientButtons.length; i++){
            ingredientButtons[i].classList.remove("unitActive");
        }

        newActive.classList.add("unitActive");
    },

    changeUnitDefault: function(){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        let id = this.ingredient.ingredient.id;
        let unit = this.ingredient.ingredient.unit;
        fetch(`/merchant/ingredients/update/${id}/${unit}`, {
            method: "put",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
        })
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    banner.createNotification("INGREDIENT DEFAULT UNIT UPDATED");
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

module.exports = ingredientDetails;