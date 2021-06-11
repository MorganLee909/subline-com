let newRecipe = {
    unchosen: [],

    display: function(){
        document.getElementById("sidebarDiv").classList.add("sidebarWide");

        document.getElementById("submitNewRecipe").onclick = ()=>{this.gatherData()};
        document.getElementById("recipeFileUpload").onclick = ()=>{controller.openModal("recipeSpreadsheet")};
        document.getElementById("newRecipeSearch").onkeyup = ()=>{this.populateChoices()};

        this.unchosen = [];
        for(let i = 0; i < merchant.inventory.length; i++){
            this.unchosen.push(merchant.inventory[i].ingredient);
        }

        this.populateChoices();
    },

    populateChoices: function(){
        this.unchosen.sort((a, b) => (a.name > b.name) ? 1 : -1);
        let searchStr = document.getElementById("newRecipeSearch").value;

        let list = document.getElementById("recipeChoices");
        while(list.children.length > 0){
            list.removeChild(list.firstChild);
        }

        for(let i = 0; i < this.unchosen.length; i++){
            if(searchStr === "" || this.unchosen[i].name.toLowerCase().includes(searchStr)){
                let ingredient = document.createElement("button");
                ingredient.innerText = this.unchosen[i].name;
                ingredient.classList.add("choosable");
                ingredient.onclick = ()=>{
                    this.add(this.unchosen[i]);
                    this.unchosen.splice(i, 1);
                    this.populateChoices();
                };
                list.appendChild(ingredient);
            }
        }
    },

    add: function(ingredient){
        let element = document.getElementById("newRecipeChosenIngredient").content.children[0].cloneNode(true);
        element.children[0].children[0].innerText = ingredient.name;
        element.children[1].children[0].placeholder = "QUANTITY";
        element.children[0].children[1].onclick = ()=>{
            this.unchosen.push(ingredient);
            element.parentElement.removeChild(element);
            this.populateChoices();
        };
        element.ingredient = ingredient;
        document.getElementById("newRecipeChosenList").appendChild(element);
    },

    gatherData: function(){
        let data = {
            name: document.getElementById("newRecipeName").value,
            category: document.getElementById("newRecipeCategory").value,
            price: parseInt(document.getElementById("newRecipePrice").value * 100),
            ingredients: []
        };
    
        let mismatchUnits = [];
        let ingredients = document.getElementById("newRecipeChosenList").children;
        for(let i = 0; i < ingredients.length; i++){
            let ingredient = ingredients[i].ingredient;
            let newIngredient = {
                ingredient: ingredient.id,
                quantity: ingredients[i].children[1].children[0].value,
                unit: ingredients[i].children[1].children[1].value
            }
    
            if(ingredient.getPotentialUnits().includes(newIngredient.unit) === false) mismatchUnits.push({ingredient: ingredient, newIngredient: newIngredient});
    
            data.ingredients.push(newIngredient);
        }

        if(mismatchUnits.length === 0){
            this.submit(data);
            return;
        }
        controller.openModal("alternateUnitConversion", mismatchUnits);
    },

    submit: function(data){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/recipe/create", {
            method: "post",
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
                    merchant.addRecipes([response]);
                    state.updateRecipes();

                    controller.createBanner("RECIPE CREATED", "success");
                    controller.openStrand("recipeBook");
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
        data.append("recipes", file);

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/recipes/create/spreadsheet", {
            method: "post",
            body: data
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    merchant.addRecipes(response);
                    state.updateRecipes();

                    controller.createBanner("ALL RECIPES SUCCESSFULLY CREATED", "success");
                    controller.openStrand("recipeBook");
                }
            })
            .catch((err)=>{
                controller.createBanner("UNABLE TO DISPLAY NEW RECIPES.  PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
};

module.exports = newRecipe;