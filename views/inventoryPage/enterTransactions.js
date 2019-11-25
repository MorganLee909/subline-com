let enterTransactionsObj = {
    isPopulated: false,

    display: function(){
        controller.clearScreen();
        controller.enterTransactionsStrand.style.display = "flex";

        if(!this.isPopulated){
            this.populateRecipes();
            this.isPopulated = true;
        }
    },

    populateRecipes: function(){
        let tbody = document.querySelector("#enterTransactionsStrand tbody");

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
        let tbody = document.querySelector("#enterTransactionsStrand tbody");

        let recipesSold = [];

        for(let row of tbody.children){
            let quantity = row.children[1].children[0].value;
            
            if(quantity > 0){
                let recipe = {
                    id: row._id,
                    quantity: quantity
                }

                recipesSold.push(recipe);
            }else if(quantity < 0){
                banner.createError("Cannot have negative quantities");
                break;
            }
        }

        axios.post("/transactions/create", recipesSold)
            .then(()=>{
                for(let soldRecipe of recipesSold){
                    let merchRecipe = merchant.recipes.find(r => r._id === soldRecipe.id);
                    for(let recipeIngredient of merchRecipe.ingredients){
                        let merchInvIngredient = merchant.inventory.find(i => i.ingredient._id === recipeIngredient.ingredient);
                        merchInvIngredient.quantity -= recipeIngredient.quantity * soldRecipe.quantity;
                    }
                }

                inventoryObj.isPopulated = false;
                inventoryObj.display();
                banner.createNotification("Your sales have been logged");
            })
            .catch((err)=>{
                banner.createError("Something went wrong and your sales could not be logged");
            });
    }
}