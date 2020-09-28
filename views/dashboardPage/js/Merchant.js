const transactions = require("./transactions");

class Merchant{
    constructor(oldMerchant, transactions, modules){
        this._modules = modules;
        this._name = oldMerchant.name;
        this._pos = oldMerchant.pos;
        this._ingredients = [];
        this._recipes = [];
        this._transactions = [];
        this._orders = [];
        this._units = {
            mass: ["g", "kg", "oz", "lb"],
            volume: ["ml", "l", "tsp", "tbsp", "ozfl", "cup", "pt", "qt", "gal"],
            length: ["mm", "cm", "m", "in", "ft"],
            other: ["each", "bottle"]
        }
        
        for(let i = 0; i < oldMerchant.inventory.length; i++){
            this.ingredients.push({
                ingredient: new modules.Ingredient(
                    oldMerchant.inventory[i].ingredient._id,
                    oldMerchant.inventory[i].ingredient.name,
                    oldMerchant.inventory[i].ingredient.category,
                    oldMerchant.inventory[i].ingredient.unitType,
                    oldMerchant.inventory[i].defaultUnit,
                    this,
                    oldMerchant.inventory[i].ingredient.specialUnit,
                    oldMerchant.inventory[i].ingredient.unitSize
                ),
                quantity: oldMerchant.inventory[i].quantity
            });
        }

        for(let i = 0; i < oldMerchant.recipes.length; i++){
            this.recipes.push(new modules.Recipe(
                oldMerchant.recipes[i]._id,
                oldMerchant.recipes[i].name,
                oldMerchant.recipes[i].price,
                oldMerchant.recipes[i].ingredients,
                this
            ));
        }

        for(let i = 0; i < transactions.length; i++){
            this.transactions.push(new modules.Transaction(
                transactions[i]._id,
                transactions[i].date,
                transactions[i].recipes,
                this
            ));
        }
    }

    get name(){
        return this._name;
    }

    set name(name){
        if(sanitaryString(name)){
            this._name = name;
        }
        return false;
    }

    get pos(){
        return this._pos;
    }

    get ingredients(){
        return this._ingredients;
    }

    addIngredient(ingredient, quantity){
        this.ingredients.push({ingredient, quantity});

        this._modules.home.isPopulated = false;
        this._modules.ingredients.isPopulated = false;
    }

    removeIngredient(ingredient){
        const index = this._ingredients.indexOf(ingredient);
        if(index === undefined){
            return false;
        }

        this._ingredients.splice(index, 1);

        this._modules.home.isPopulated = false;
        this._modules.ingredients.isPopulated = false;
    }

    updateIngredient(ingredient, quantity){
        const index = this._ingredients.indexOf(ingredient);
        if(index = undefined){
            return false;
        }

        this._ingredients[index].quantity = quantity;

        this._modules.home.isPopulated = false;
        this._modules.ingredients.isPopulated = false;
    }

    get recipes(){
        return this._recipes;
    }

    addRecipe(recipe){
        this._recipes.push(recipe);

        this._modules.transactions.isPopulated = false;
        this._modules.recipeBook.isPopulated = false;
    }

    removeRecipe(recipe){
        const index = this._recipes.indexOf(recipe);
        if(index === undefined){
            return false;
        }

        this._recipes.splice(index, 1);

        this._modules.transactions.isPopulated = false;
        this._modules.recipeBook.isPopulated = false;
    }

    getTransactions(from = 0, to = new Date()){
        if(from > end){
            return false;
        }

        if(from === 0){
            from = this.transactions[0].date;
        }

        const {from, to} = this.getTransactionIndices(from, to);

        return this.transactions.slice(from, to);
    }

    addTransaction(transaction){
        this._transactions.push(transaction);
        this._transactions.sort((a, b)=>{
            if(a.date > b.date){
                return -1;
            }
            return 1;
        });

        let ingredients = {};
        for(let i = 0; i < transaction.recipes.length; i++){
            const recipe = transaction.recipes[i];
            for(let j = 0; j < recipe.recipe.ingredients.length; j++){
                const ingredient = recipe.ingredients[i];
                if(ingredients[ingredient.ingredient.id]){
                    ingredients[ingredient.ingredient.id] += recipe.quantity * ingredient.quantity;
                }else{
                    ingredients[ingredient.ingredient.id] = recipe.quantity * ingredient.quantity;
                }
            } 
        }

        const keys = Object.keys(ingredients);
        for(let i = 0; i < keys.length; i++){
            for(let j = 0; j < this._ingredients.length; j++){
                if(keys[i] === this._ingredients[j].ingredient.id){
                    this._ingredients.quantity -= ingredients[keys[i]];
                }
            }
        }

        this._modules.home.isPopulated = false;
        this._modules.ingredients.isPopulated = false;
        this._modules.transactions.isPopulated = false;
        this._modules.analytics.newData = true;
    }

    removeTransaction(transaction){
        const index = this._transactions.indexOf(transaction);
        if(index === undefined){
            return false;
        }

        this._transactions.splice(index, 1);

        let ingredients = {};
        for(let i = 0; i < transaction.recipes.length; i++){
            const recipe = transaction.recipes[i];
            for(let j = 0; j < recipe.recipe.ingredients.length; j++){
                const ingredient = recipe.recipe.ingredients[i];
                if(ingredients[ingredient.ingredient.id]){
                    ingredients[ingredient.ingredient.id] += ingredient.quantity * recipe.quantity;
                }else{
                    ingredients[ingredient.ingredient.id] = ingredient.quantity * recipe.quantity;
                }
            }
        }

        const keys = Object.keys(ingredients);
        for(let i = 0; i < keys.length; i++){
            for(let j = 0; j < this._ingredients.length; j++){
                if(keys[i] === this._ingredients[j].ingredient.id){
                    this._ingredients.quantity += ingredients[keys[i]];
                }
            }
        }

        this._modules.home.isPopulated = false;
        this._modules.ingredients.isPopulated = false;
        this._modules.transactions.isPopulated = false;
        this._modules.analytics.newData = true;
    }

    get orders(){
        return this._orders;
    }

    addOrder(order, isNew = false){
        this._orders.push(order);

        if(isNew){
            for(let i = 0; i < order.ingredients.length; i++){
                for(let j = 0; j < this._ingredients.length; j++){
                    if(order.ingredients[i] === this._ingredients[j].ingredient){
                        this._ingredients[j].quantity += order.ingredients[i].quantity;
                        break;
                    }
                }
            }
        }

        this._modules.ingredients.isPopulated = false;
        this._modules.orders.isPopulated = false;
    }

    removeOrder(order){
        const index = this._orders.indexOf(order);
        if(index === undefined){
            return false;
        }

        this._orders.splice(index, 1);

        for(let i = 0; i < order.ingredients.length; i++){
            for(let j = 0; j < this._ingredients.length; j++){
                if(order.ingredients[i].ingredient === this._ingredients[j].ingredient){
                    this._ingredients[j].quantity -= order.ingredients[i].quantity;
                }
            }
        }

        this._modules.ingredients.isPopulated = false;
        this._modules.orders.isPopulated = false;
    }

    get units(){
        return this._units;
    }

    getRevenue(from, to = new Date()){
        if(from === 0){
            from = this.transactions[0].date;
        }

        const {start, end} = this.getTransactionIndices(from, to);

        let total = 0;
        for(let i = start; i <= end; i++){
            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                for(let k = 0; k < this.recipes.length; k++){
                    if(this.transactions[i].recipes[j].recipe === this.recipes[k]){
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
    getIngredientsSold(from = 0, to = new Date()){
        if(from = 0){
            from = this._ingredients[0].date;
        }
        
        let recipes = this.getRecipesSold(from, to);
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

    getSingleIngredientSold(ingredient, from = 0, to = new Date()){
        if(from === 0){
            from = this._transactions[0].date;
        }

        const {start, end} = this.getTransactionIndices(from, to);

        let total = 0;
        for(let i = start; i < end; i++){
            for(let j = 0; j < this._transactions[i].recipes.length; j++){
                for(let k = 0; k < this._transactions[i].recipes[j].recipe.ingredients.length; k++){
                    if(this._transactions[i].recipes[j].recipe.ingredients[k].ingredient === ingredient.ingredient){
                        total += this._transactions[i].recipes[j].recipe.ingredients[k].quantity;
                        break;
                    }
                }
            }
        }

        return total;
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
    getRecipesSold(from = 0, to = new Date()){
        if(from = 0){
            from = this._transactions[0].date;
        }

        const {start, end} = this.getTransactionIndices(from, to);

        let recipeList = [];
        for(let i = start; i <= end; i++){
            for(let j = 0; j < this._transactions[i].recipes.length; j++){
                let exists = false;
                for(let k = 0; k < recipeList.length; k++){
                    if(recipeList[k].recipe === this._transactions[i].recipes[j].recipe){
                        exists = true;
                        recipeList[k].quantity += this._transactions[i].recipes[j].quantity;
                        break;
                    }
                }

                if(!exists){
                    recipeList.push({
                        recipe: this._transactions[i].recipes[j].recipe,
                        quantity: this._transactions[i].recipes[j].quantity
                    });
                }
            }
        }

        return recipeList;
    }
    
    /*
    Groups all of the merchant's ingredients by their category
    Return: [{
        name: category name,
        ingredients: [Ingredient Object]
    }]
    */
    categorizeIngredients(){
        let ingredientsByCategory = [];

        for(let i = 0; i < this.ingredients.length; i++){
            let categoryExists = false;
            for(let j = 0; j < ingredientsByCategory.length; j++){
                if(this.ingredients[i].ingredient.category === ingredientsByCategory[j].name){
                    ingredientsByCategory[j].ingredients.push(this.ingredients[i]);

                    categoryExists = true;
                    break;
                }
            }

            if(!categoryExists){
                ingredientsByCategory.push({
                    name: this.ingredients[i].ingredient.category,
                    ingredients: [this.ingredients[i]]
                });
            }
        }

        return ingredientsByCategory;
    }

    unitizeIngredients(){
        let ingredientsByUnit = [];

        for(let i = 0; i < this.ingredients.length; i++){
            let unitExists = false;
            const innerIngredient = this.ingredients[i].ingredient;
            for(let j = 0; j < ingredientsByUnit.length; j++){
                if(innerIngredient.unit === ingredientsByUnit[j].name || innerIngredient.specialUnit === ingredientsByUnit[j].name){
                    ingredientsByUnit[j].ingredients.push(this.ingredients[i]);

                    unitExists = true;
                    break;
                }
            }

            if(!unitExists){
                let unit = "";
                if(innerIngredient.specialUnit === "bottle"){
                    unit = "bottle";
                }else{
                    unit = innerIngredient.unit;
                }

                ingredientsByUnit.push({
                    name: unit,
                    ingredients: [this.ingredients[i]]
                });
            }
        }

        return ingredientsByUnit;
    }

    getRecipesForIngredient(ingredient){
        let recipes = [];

        for(let i = 0; i < this._recipes.length; i++){
            for(let j = 0; j < this._recipes[i].ingredients.length; j++){
                if(this._recipes[i].ingredients[j].ingredient === ingredient){
                    recipes.push(this._recipes[i]);
                }
            }
        }

        return recipes;
    }

    getTransactionIndices(from, to){
        for(let i = 0; i < this.transactions.length; i++){
            if(this.transactions[i].date >= from){
                from = i;
                break;
            }
        }
        
        for(let i = this.transactions.length - 1; i >= 0; i--){
            if(transactions[i].date <= to){
                to = i;
                break;
            }
        }

        return {from: from, to: to};
    }
}

module.exports = Merchant;