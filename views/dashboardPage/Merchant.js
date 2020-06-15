class Ingredient{
    constructor(id, name, category, unit){
        this.id = id;
        this.name = name;
        this.category = category;
        this.unit = unit;
    }
}

class Recipe{
    constructor(id, name, price, ingredients, parent){
        this.id = id;
        this.name = name;
        this.price = price;
        this.parent = parent;
        this.ingredients = [];

        for(let i = 0; i < ingredients.length; i++){
            for(let j = 0; j < parent.ingredients.length; j++){
                if(ingredients[i].ingredient === parent.ingredients[j].ingredient.id){
                    this.ingredients.push({
                        ingredient: parent.ingredients[j].ingredient,
                        quantity: ingredients[i].quantity
                    });
                    break;
                }
            }
        }
    }
}

/*
parent: merchant associated with,
date: date created,
recipes: [{
    recipe: Recipe Object,
    quantity: quantity of the recipe
}
*/
class Transaction{
    constructor(date, recipes, parent){
        this.parent = parent;
        this.date = new Date(date);
        this.recipes = [];

        for(let i = 0; i < recipes.length; i++){
            for(let j = 0; j < parent.recipes.length; j++){
                if(recipes[i].recipe === parent.recipes[j].id){
                    this.recipes.push({
                        recipe: parent.recipes[j],
                        quantity: recipes[i].quantity
                    });
                    break;
                }
            }
        }
    }
}

class Merchant{
    constructor(oldMerchant, transactions){
        this.name = oldMerchant.name;
        this.ingredients = [];
        this.recipes = [];
        this.transactions = [];
        
        for(let i = 0; i < oldMerchant.inventory.length; i++){
            this.ingredients.push({
                ingredient: new Ingredient(
                    oldMerchant.inventory[i].ingredient._id,
                    oldMerchant.inventory[i].ingredient.name,
                    oldMerchant.inventory[i].ingredient.category,
                    oldMerchant.inventory[i].ingredient.unit,
                ),
                quantity: oldMerchant.inventory[i].quantity
            });
        }

        for(let i = 0; i < oldMerchant.recipes.length; i++){
            this.recipes.push(new Recipe(
                oldMerchant.recipes[i]._id,
                oldMerchant.recipes[i].name,
                oldMerchant.recipes[i].price,
                oldMerchant.recipes[i].ingredients,
                this
            ));
        }

        
        for(let i = 0; i < transactions.length; i++){
            this.transactions.push(new Transaction(
                transactions[i].date,
                transactions[i].recipes,
                this
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
    transactionIndices(from, to = new Date()){
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

    revenue(indices){
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

    /*
    Gets the quantity of each ingredient sold between two dates (dateRange)
    Inputs
    dateRange: list containing a start date and an end date
    Return:
        [{
            ingredient: Ingredient object,
            quantity: quantity of ingredient sold
        }]
    */
    ingredientsSold(dateRange){
        if(!dateRange){
            return false;
        }
        
        let recipes = this.recipesSold(dateRange);
        let ingredientList = [];

        for(let i = 0; i < recipes.length; i++){
            for(let j = 0; j < recipes[i].recipe.ingredients.length; j++){
                let exists = false;

                for(let k = 0; k < ingredientList.length; k++){
                    if(ingredientList[k].ingredient === recipes[i].recipe.ingredients[j].ingredient){
                        exists = true;
                        ingredientList[k].quantity += recipes[i].quantity * recipes[i].recipe.ingredients[j].quantity;
                        break;
                    }
                }

                if(!exists){
                    ingredientList.push({
                        ingredient: recipes[i].recipe.ingredients[j].ingredient,
                        quantity: recipes[i].quantity * recipes[i].recipe.ingredients[j].quantity
                    });
                }
            }
        }
    
        return ingredientList;
    }

    /*
    Gets the number of recipes sold between two dates (dateRange)
    Inputs:
        dateRange: array containing a start date and an end date
    Return:
        [{
            recipe: a recipe object
            quantity: quantity of the recipe sold
        }]
    */
    recipesSold(dateRange){
        let recipeList = [];

        for(let i = dateRange[0]; i <= dateRange[1]; i++){
            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                let exists = false;
                for(let k = 0; k < recipeList.length; k++){
                    if(recipeList[k].recipe === this.transactions[i].recipes[j].recipe){
                        exists = true;
                        recipeList[k].quantity += this.transactions[i].recipes[j].quantity;
                        break;
                    }
                }

                if(!exists){
                    recipeList.push({
                        recipe: this.transactions[i].recipes[j].recipe,
                        quantity: this.transactions[i].recipes[j].quantity
                    });
                }
            }
        }

        return recipeList;
    }

    /*
    Create revenue data for graphing
    Input:
        dateRange: [start index, end index] (this.transactionIndices)
    Return:
        [total revenue for each day]
    */
    graphDailyRevenue(dateRange){
        if(!dateRange){
            return false;
        }

        let dataList = new Array(30).fill(0);
        let currentDate = this.transactions[dateRange[0]].date;
        let arrayIndex = 0;

        for(let i = dateRange[0]; i <= dateRange[1]; i++){
            if(this.transactions[i].date.getDate() !== currentDate.getDate()){
                currentDate = this.transactions[i].date;
                arrayIndex++;
            }

            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                dataList[arrayIndex] += this.transactions[i].recipes[j].recipe.price * this.transactions[i].recipes[j].quantity;
            }
        }

        return dataList;
    }
}

class Order{
    constructor(date, ingredients){
        this.date = date;
        this.ingredients = ingredients;
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