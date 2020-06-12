class Ingredient{
    constructor(id, name, category, unit, quantity){
        if(this.validate(name, category, unit, quantity)){
            this.id = id;
            this.name = name;
            this.category = category;
            this.unit = unit;
            this.quantity = quantity
        }
    }

    validate(name, category, unit, quantity, createBanner = true){
        let errors = [];
        if(!isSanitary(name) ||
        !isSanitary(category) ||
        !isSanitary(unit)){
            errors.push("Contains illegal characters");
        }

        if(isNaN(quantity) || quantity === ""){
            errors.push("Must enter a valid number");
        }

        if(quantity < 0){
            banner.createError("Quantity cannot be a negative number");
        }

        if(errors.length > 0){
            if(createBanner){
                for(let i = 0; i < errors.length; i++){
                    banner.createError(errors[i]);
                }
            }

            return false;
        }

        return true;
    }
}

class Recipe{
    constructor(name, price, ingredients){
        this.name = name;
        this.price = price
        this.ingredients = ingredients;
    }
}

class Merchant{
    constructor(oldMerchant, transactions){
        this.name = oldMerchant.name;
        this.inventory = [];
        this.recipes = [];
        this.transactions = [];
        
        for(let i = 0; i < oldMerchant.inventory.length; i++){
            this.inventory.push(new Ingredient(
                oldMerchant.inventory[i].ingredient._id,
                oldMerchant.inventory[i].ingredient.name,
                oldMerchant.inventory[i].ingredient.category,
                oldMerchant.inventory[i].ingredient.unit,
                oldMerchant.inventory[i].quantity
            ));
        }

        for(let i = 0; i < oldMerchant.recipes.length; i++){
            let newRecipe = {
                name: oldMerchant.recipes[i].name,
                price: oldMerchant.recipes[i].price,
                ingredients: [],
            }

            for(let j = 0; j < oldMerchant.recipes[i].ingredients.length; j++){
                for(let k = 0; k < this.inventory.length; k++){
                    if(oldMerchant.recipes[i].ingredients[j].ingredient._id === this.inventory[k].id){
                        newRecipe.ingredients.push({
                            ingredient: this.inventory[k],
                            quantity: oldMerchant.recipes[i].ingredients[j].quantity
                        });

                        break;
                    }
                }
            }
        }

        for(let i = 0; i < transactions.length; i++){
            this.transactions.push(new Transaction(
                transactions[i].date,
                transactions[i].recipes
            ));
        }
    }

    /*
    Updates all specified item in the merchant's inventory and updates the page
    If ingredient doesn't exist, add it
    Inputs:
    Array of objects
        id: id of ingredient
        quantityChange: change in quantity (if not removing)
        name: name of ingredient (only for new ingredient)
        category: category of ingredient (only for new ingredient)
        unit: unit of measurement (only for new ingredient)
    remove: if true, remove ingredient from inventory
    */
    addIngredients(ingredients, remove = false){
        for(let i = 0; i < ingredients.length; i++){
            let isNew = true;
            for(let j = 0; j < merchant.inventory.length; j++){
                if(merchant.inventory[j].ingredient._id === ingredients[i].id){
                    if(remove){
                        merchant.inventory.splice(j, 1);
                    }else{
    
                        merchant.inventory[j].quantity += ingredients[i].quantity;
                    }
    
                    isNew = false;
                    break;
                }
            }
    
            if(isNew){
                merchant.inventory.push({
    
                    ingredient: {
                        _id: ingredients[i].id,
                        category: ingredients[i].category,
                        name: ingredients[i].name,
                        unit: ingredients[i].unit
                    },
                    quantity: parseFloat(ingredients[i].quantityChange)
                });
            }
        }
    
        homeStrandObj.drawInventoryCheckCard();
        ingredientsStrandObj.populateByProperty("category");
        addIngredientsComp.isPopulated = false;
        closeSidebar();
    }

    /*
    Updates a recipe in the merchants list of recipes
    Can create, edit or remove
    Inputs:
        recipe: object
            _id: id of recipe
            name: name of recipe
            price: price of recipe
            ingredients: list of ingredients
                ingredient: id of ingredient
                quantity: quantity of ingredient
        remove: if true, remove ingredient from inventory
    */
    addRecipe(recipe, remove = false){
        let isNew = true;
        let index = 0;

        for(let i = 0; i < recipe.ingredients.length; i++){
            for(let j = 0; j < merchant.inventory.length; j++){
                if(merchant.inventory[j].ingredient._id === recipe.ingredients[i].ingredient){
                    recipe.ingredients[i].ingredient = merchant.inventory[j].ingredient;
                    break;
                }
            }
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            if(recipe._id === merchant.recipes[i]._id){
                if(remove){
                    merchant.recipes.splice(i, 1);
                }else{
                    merchant.recipes[i] = recipe;
                    index = i;
                }

                isNew = false;
                break;
            }
        }

        if(isNew){
            merchant.recipes.push(recipe);
            index = merchant.recipes.length - 1;
        }

        recipeBookStrandObj.populateRecipes();
        closeSidebar();
    }

    /*
    Gets the indices of two dates from transactions
    Inputs
    from: starting date
    to: ending date (default to now)
    Output
    Array containing starting index and ending index
    Note: Will return false if it cannot find both necessary dates
    */
    getTransactionIndices(from, to = new Date()){
        let indices = [];

        for(let i = 0; i < this.transactions.length; i++){
            if(this.transactions[i].date > from){
                indices.push(i);
                break;
            }
        }

        for(let i = this.transactions.length - 1; i >=0; i--){
            if(this.transactions[i].date < to){
                indices.push(i);
                break;
            }
        }

        if(indices.length < 2){
            return false;
        }

        return indices;
    }

    calculateRevenue(indices){
        let total = 0;

        for(let i = indices[0]; i <= indices[1]; i++){
            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                for(let k = 0; k < this.recipes.length; k++){
                    if(this.transactions[i].recipes[j].recipe === this.recipes[k]._id){
                        total += this.transactions[i].recipes[j].quantity * this.recipes[k].price;
                    }
                }
            }
        }

        return total / 100;
    }
}

class Order{
    constructor(date, ingredients){
        this.date = date;
        this.ingredients = ingredients;
    }
}

class Transaction{
    constructor(date, recipes){
        this.date = new Date(date);
        this.recipes = recipes;
    }
}

let isSanitary =  (str, createBanner = true)=>{
    let disallowed = ["\\", "<", ">", "$", "{", "}", "(", ")"];

    for(let char of disallowed){
        if(str.includes(char)){
            if(createBanner){
                banner.createError("Your string contains illegal characters");
            }
            return false;
        }
    }

    return true;
}