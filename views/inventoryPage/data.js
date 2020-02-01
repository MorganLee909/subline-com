window.dataObj = {
    display: function(){
        clearScreen();
        document.querySelector("#dataStrand").style.display = "flex";
    },

    populate: function(transactions){
        //Create object to store number of recipes sold
        let recipes = [];
        for(let recipe of merchant.recipes){
            recipes.push({
                id: recipe._id,
                name: recipe.name,
                quantity: 0,
                ingredients: recipe.ingredients 
            });
        }

        //Populate number of recipes sold
        for(let transaction of transactions){
            for(let transactionRecipe of transaction.recipes){
                for(let recipeCounter of recipes){
                    if(transactionRecipe === recipeCounter.id){
                        recipeCounter.quantity++;
                    }
                }
            }
        }

        //Create object to store amount of ingredients sold
        let ingredients = [];
        for(let item of merchant.inventory){
            ingredients.push({
                id: item.ingredient._id,
                name: item.ingredient.name,
                quantity: 0,
                quantityRemaining: item.quantity
            });
        }

        //Populate amount of ingredients sold
        for(let recipe of recipes){
            for(let recipeIngredient of recipe.ingredients){
                for(let newIngredient of ingredients){
                    if(newIngredient.id === recipeIngredient.ingredient._id){
                        newIngredient.quantity += recipeIngredient.quantity;
                        break;
                    }
                }
            }
        }

        //Populate Ingredients table
        
    }
}