window.homeObj = {
    recipeTotal: 0,
    revenueTotal: 0,

    display: function(){
        clearScreen();
        document.querySelector("#homeStrand").style.display = "flex";

        //Fill in month
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        document.querySelector("#month").innerText = `Month of ${months[new Date().getMonth()]}`;

        this.populate();
    },

    populate: function(){
        //Create object to store number of recipes sold
        let recipes = [];
        for(let recipe of data.merchant.recipes){
            recipes.push({
                id: recipe._id,
                name: recipe.name,
                quantity: 0,
                ingredients: recipe.ingredients,
                price: recipe.price / 100
            });
        }

        //Create object to store amount of ingredients sold
        let soldIngredients = [];
        for(let item of data.merchant.inventory){
            soldIngredients.push({
                id: item.ingredient._id,
                name: item.ingredient.name,
                quantity: 0,
                quantityRemaining: item.quantity,
                unit: item.ingredient.unit
            });
        }

        //Create object for each merchant ingredient
        let purchaseIngredients = [];
        for(let item of data.merchant.inventory){
            purchaseIngredients.push({
                id: item.ingredient._id,
                name: item.ingredient.name,
                amount: 0,
                unit: item.ingredient.unit
            });
        }
        
        //Populate number of recipes sold
        for(let transaction of data.transactions){
            for(let recipe of transaction.recipes){
                for(let newRecipe of recipes){
                    if(recipe.recipe === newRecipe.id){
                        newRecipe.quantity += recipe.quantity;
                        this.recipeTotal += recipe.quantity;
                        this.revenueTotal += (newRecipe.price * recipe.quantity);
                        break;
                    }
                }
            }
        }

        //Populate amount of ingredients sold
        for(let recipe of recipes){
            for(let recipeIngredient of recipe.ingredients){
                for(let newIngredient of soldIngredients){
                    if(newIngredient.id === recipeIngredient.ingredient){
                        newIngredient.quantity += (recipeIngredient.quantity * recipe.quantity);
                        break;
                    }
                }
            }
        }

        //Populate amount of ingredients purchased
        for(let purchase of data.purchases){
            for(let newPurchaseIngredient of purchase.ingredients){
                for(let newIngredient of purchaseIngredients){
                    if(newIngredient.id === newPurchaseIngredient.ingredient){
                        newIngredient.amount += newPurchaseIngredient.quantity;
                        break;
                    }
                }
            }
        }

        //Populate Ingredients table
        let ingredientsBody = document.querySelector("#ingredientsData tbody");
        
        for(let ingredient of soldIngredients){
            let row = document.createElement("tr");
            ingredientsBody.appendChild(row);

            let name = document.createElement("td");
            name.innerText = `${ingredient.name} (${ingredient.unit})`;
            row.appendChild(name);

            let used = document.createElement("td");
            used.innerText = ingredient.quantity;
            row.appendChild(used);

            let remaining = document.createElement("td");
            remaining.innerText = ingredient.quantityRemaining;
            row.appendChild(remaining);
        }

        //Populate recipes table
        let recipesBody = document.querySelector("#recipesData tbody");

        for(let recipe of recipes){
            let row = document.createElement("tr");
            recipesBody.appendChild(row);

            let name = document.createElement("td");
            name.innerText = recipe.name;
            row.appendChild(name);

            let quantity = document.createElement("td");
            quantity.innerText = recipe.quantity;
            row.appendChild(quantity);

            let revenue = document.createElement("td");
            revenue.innerText = `$${(recipe.quantity * recipe.price).toFixed(2)}`;
            row.appendChild(revenue);
        }

        //Populate purchases table
        let purchasesBody = document.querySelector("#purchasesData tbody");
        
        for(let ingredient of purchaseIngredients){
            let row = document.createElement("tr");
            purchasesBody.appendChild(row);
            
            let name = document.createElement("td");
            name.innerText = `${ingredient.name} (${ingredient.unit})`;
            row.appendChild(name);

            let amount = document.createElement("td");
            amount.innerText = ingredient.amount;
            row.appendChild(amount);
        }

        //Populate totals
        document.querySelector("#revenueTotal").innerText = `$${this.revenueTotal.toFixed(2)}`;
        document.querySelector("#soldTotal").innerText = this.recipeTotal;
    }
}