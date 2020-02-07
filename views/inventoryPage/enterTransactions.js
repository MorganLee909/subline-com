window.enterTransactionsObj = {
    isPopulated: false,

    display: function(){
        clearScreen();
        document.querySelector("#enterTransactionsAction").style.display = "flex";

        document.querySelector("#updated").innerText = new Date(Number(merchant.lastUpdatedTime)).toDateString();

        if(!this.isPopulated){
            this.populateRecipes();
            this.isPopulated = true;
        }
    },

    populateRecipes: function(){
        let tbody = document.querySelector("#enterTransactionsAction tbody");

        for(let recipe of merchant.recipes){
            let row = document.createElement("tr");
            row._id = recipe._id;
            tbody.appendChild(row);

            let name = document.createElement("td");
            name.innerText = recipe.name;
            row.appendChild(name);

            let quantity = document.createElement("td");
            row.appendChild(quantity);

            let input = document.createElement("input");
            input.type = "number";
            input.step = "1";
            input.value = "0";
            quantity.appendChild(input);
        }
    },

    submit: function(){
        let tbody = document.querySelector("#enterTransactionsAction tbody");

        let recipes = [];

        for(let row of tbody.children){
            let quantity = row.children[1].children[0].value;
            
            if(quantity > 0){
                let recipe = {
                    id: row._id,
                    quantity: quantity
                }
                recipes.push(recipe);
            }else if(quantity < 0){
                banner.createError("Cannot have negative quantities");
                return;
            }
        }

        axios.post("/transactions/create", recipes)
            .then((response)=>{
                if(typeof(response.data) === "string"){
                    banner.createError(response.data);
                }else{
                    for(let recipe of recipes){
                        let merchRecipe = merchant.recipes.find(r => r._id === recipe.id);
                        for(let recipeIngredient of merchRecipe.ingredients){
                            let merchInvIngredient = merchant.inventory.find(i => i.ingredient._id === recipeIngredient.ingredient._id);
                            merchInvIngredient.quantity -= recipeIngredient.quantity * recipe.quantity;
                        }
                    }

                    inventoryObj.isPopulated = false;
                    inventoryObj.display();
                    banner.createNotification("Your sales have been logged");
                }
            })
            .catch((err)=>{
                banner.createError("Something went wrong and your sales could not be logged");
            });
    }
}