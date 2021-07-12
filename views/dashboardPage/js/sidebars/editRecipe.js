module.exports = {
    unused: [],

    display: function(recipe){
        let title = document.getElementById("editRecipeTitle");
        let name = document.getElementById("editRecipeName");
        let category = document.getElementById("editRecipeCategory");
        let price = document.getElementById("editRecipePrice");
        title.innerText = recipe.name;
        name.children[0].value = recipe.name;
        category.children[0].value = recipe.category;
        price.children[0].value = recipe.price;

        if(merchant.pos === "none"){
            name.style.display = "flex";
            category.style.display = "flex";
            price.style.display = "flex";
            title.style.display = "none";
        }

        document.getElementById("sidebarDiv").classList.add("sidebarWide");
        document.getElementById("editRecipeSearch").oninput = ()=>{this.search()};
        document.getElementById("editRecipeSubmit").onclick = ()=>{this.gatherData(recipe)};
        let used = document.getElementById("editRecipeUsed");
        let template = document.getElementById("editRecipeInputItem").content.children[0];
        let tempList = [];

        while(used.children.length > 0){
            used.removeChild(used.firstChild);
        }

        for(let i = 0; i < recipe.ingredients.length; i++){
            tempList.push(recipe.ingredients[i].ingredient.id);

            let ingredient = template.cloneNode(true);
            ingredient.ingredient = recipe.ingredients[i].ingredient;
            ingredient.children[0].children[0].innerText = recipe.ingredients[i].ingredient.name;
            ingredient.children[0].children[1].onclick = ()=>{this.removeIngredient(ingredient)};
            ingredient.children[1].children[0].value = recipe.ingredients[i].quantity;
            ingredient.children[1].children[1].value = recipe.ingredients[i].unit;
            used.appendChild(ingredient);
        }

        this.unused = [];
        for(let i = 0; i < merchant.inventory.length; i++){
            if(tempList.includes(merchant.inventory[i].ingredient.id)) continue;
            this.unused.push(merchant.inventory[i].ingredient);
        }

        this.displayUnused(this.unused);
    },

    displayUnused: function(items){
        let container = document.getElementById("editRecipeUnused");
        items.sort((a, b) => (a.name > b.name) ? 1 : -1);

        while(container.children.length > 0){
            container.removeChild(container.firstChild);
        }

        for(let i = 0; i < items.length; i++){
            let button = document.createElement("button");
            button.innerText = items[i].name;
            button.classList.add("choosable");
            button.classList.add("selection");
            button.ingredient = items[i];
            button.onclick = ()=>{this.addIngredient(button)};
            container.appendChild(button);
        }
    },

    addIngredient: function(ingredient){
        for(let i = 0; i < this.unused.length; i++){
            if(this.unused[i] === ingredient.ingredient){
                this.unused.splice(i, 1);
                break;
            }
        }

        let unused = document.getElementById("editRecipeUnused");
        unused.removeChild(ingredient);
        let used = document.getElementById("editRecipeUsed");
        
        let newItem = document.getElementById("editRecipeInputItem").content.children[0].cloneNode(true);
        newItem.ingredient = ingredient.ingredient;
        newItem.children[0].children[0].innerText = ingredient.ingredient.name;
        newItem.children[0].children[1].onclick = ()=>{this.removeIngredient(newItem)};
        used.appendChild(newItem);
    },

    removeIngredient: function(ingredient){
        let used = document.getElementById("editRecipeUsed");

        this.unused.push(ingredient.ingredient);

        used.removeChild(ingredient);
        this.displayUnused(this.unused);
    },

    search: function(){
        let text = document.getElementById("editRecipeSearch").value;
        let newList = [];

        for(let i = 0; i < this.unused.length; i++){
            let name = this.unused[i].name.toLowerCase();
            if(name.includes(text) === true){
                newList.push(this.unused[i]);
            }
        }

        this.displayUnused(newList);
    },

    gatherData: function(recipe){
        let items = document.getElementById("editRecipeUsed");
        let data = {
            id: recipe.id,
            name: document.getElementById("editRecipeName").children[0].value,
            price: parseInt(document.getElementById("editRecipePrice").children[0].value * 100),
            category: document.getElementById("editRecipeCategory").children[0].value,
            ingredients: []
        };

        let mismatchUnits = [];
        for(let i = 0; i < items.children.length; i++){
            let item = items.children[i];
    
            let ingredient = {
                ingredient: item.ingredient.id,
                quantity: item.children[1].children[0].value,
                unit: item.children[1].children[1].value
            };

            if(item.ingredient.getPotentialUnits().includes(ingredient.unit) === false){
                mismatchUnits.push({ingredient: item.ingredient, newIngredient: ingredient});
            }else{
                ingredient.baseUnitMultiplier = 1 / controller.baseUnit(1, ingredient.unit);
            }
    
            data.ingredients.push(ingredient);
        }

        if(mismatchUnits.length === 0){
            this.submit(data);
            return;
        }
        controller.openModal("alternateUnitConversion", {mismatchUnits: mismatchUnits, recipe: data, submit: this.submit});
    },

    submit: function(data){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/recipe/update", {
            method: "put",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    merchant.updateRecipe(merchant.getRecipe(response._id), response);
                    state.updateRecipes();
                    controller.closeSidebar();
                    controller.createBanner("RECIPE UPDATED", "success");
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