window.dataObj = {
    display: function(){
        clearScreen();
        document.querySelector("#dataStrand").style.display = "flex";

        //Fill in month
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        document.querySelector("#month").innerText = `Month of ${months[new Date().getMonth()]}`;
    },

    populate: function(transactions){
        //Create object to store number of recipes sold
        let recipes = [];
        for(let recipe of merchant.recipes){
            recipes.push({
                id: recipe._id,
                name: recipe.name,
                quantity: 0,
                ingredients: recipe.ingredients,
                price: recipe.price / 100
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
                quantityRemaining: item.quantity,
                unit: item.ingredient.unit
            });
        }

        //Populate amount of ingredients sold
        for(let recipe of recipes){
            for(let recipeIngredient of recipe.ingredients){
                for(let newIngredient of ingredients){
                    if(newIngredient.id === recipeIngredient.ingredient._id){
                        newIngredient.quantity += (recipeIngredient.quantity * recipe.quantity);
                        break;
                    }
                }
            }
        }

        //Populate Ingredients table
        let ingredientsBody = document.querySelector("#ingredientsData tbody");
        
        for(let ingredient of ingredients){
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
            revenue.innerText = `$${recipe.quantity * recipe.price}`;
            row.appendChild(revenue);
        }
    },

    populatePurchases: function(purchases){
        //Create object for each merchant ingredient
        let ingredients = [];

        for(let item of merchant.inventory){
            ingredients.push({
                id: item.ingredient._id,
                name: item.ingredient.name,
                amount: 0,
                unit: item.ingredient.unit
            });
        }

        //Populate amount of ingredients purchased
        for(let purchase of purchases){
            for(let purchaseIngredient of purchase.ingredients){
                for(let newIngredient of ingredients){
                    if(newIngredient.id === purchaseIngredient.ingredient){
                        newIngredient.amount += purchaseIngredient.quantity;
                        break;
                    }
                }
            }
        }

        //Populate purchases table
        let purchasesBody = document.querySelector("#purchasesData tbody");
        
        for(let ingredient of ingredients){
            let row = document.createElement("tr");
            purchasesBody.appendChild(row);
            
            let name = document.createElement("td");
            name.innerText = `${ingredient.name} (${ingredient.unit})`;
            row.appendChild(name);

            let amount = document.createElement("td");
            amount.innerText = ingredient.amount;
            row.appendChild(amount);
        }
    }
}