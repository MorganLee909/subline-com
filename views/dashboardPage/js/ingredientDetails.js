let ingredientDetails = {
    ingredient: {},
    dailyUse: 0,

    display: function(ingredient){
        this.ingredient = ingredient;

        document.getElementById("ingredientDetailsCategory").innerText = ingredient.ingredient.category;

        let categoryInput = document.getElementById("detailsCategoryInput");
        categoryInput.value = "";
        categoryInput.placeholder = ingredient.ingredient.category;

        document.getElementById("ingredientDetailsName").innerText = ingredient.ingredient.name;
        
        let nameInput = document.getElementById("ingredientDetailsNameIn");
        nameInput.value = "";
        nameInput.placeholder = ingredient.ingredient.name;

        let stockInput = document.getElementById("ingredientInput");
        document.getElementById("ingredientStock").innerText = `${ingredient.ingredient.convert(ingredient.quantity).toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;
        stockInput.value = "";
        stockInput.placeholder = ingredient.ingredient.convert(ingredient.quantity).toFixed(2);

        let quantities = [];
        let now = new Date();
        for(let i = 1; i < 31; i++){
            let endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
            let startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i - 1);
            let indices = merchant.transactionIndices(startDay, endDay);

            if(indices === false){
                quantities.push(0);
            }else{
                quantities.push(merchant.singleIngredientSold(indices, ingredient));
            }
        }

        let sum = 0;
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
        }

        let dailyUse = sum / quantities.length;
        document.getElementById("dailyUse").innerText = `${ingredient.ingredient.convert(dailyUse).toFixed(2)} ${ingredient.ingredient.unit}`;

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

        fetch(`/merchant/ingredients/remove/${this.ingredient.ingredient.id}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    banner.createNotification("INGREDIENT REMOVED");
                    merchant.editIngredients([this.ingredient], true);
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
    },

    editSubmit: function(){
        let ingredientButtons = document.querySelectorAll(".unitButton");
        for(let i = 0; i < ingredientButtons.length; i++){
            if(ingredientButtons[i].classList.contains("unitActive")){
                this.ingredient.ingredient.unit = ingredientButtons[i].innerText.toLowerCase();
                break;
            }
        }

        const quantityElem = document.getElementById("ingredientInput");
        if(quantityElem.value !== ""){
            this.ingredient.quantity = controller.convertToMain(
                this.ingredient.ingredient.unit,
                Number(document.getElementById("ingredientInput").value)
            );
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
                    merchant.editIngredients([this.ingredient]);

                    this.display(this.ingredient);

                    banner.createNotification("INGREDIENT UPDATED");
                }
            })
            .catch((err)=>{
                console.log(err);
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