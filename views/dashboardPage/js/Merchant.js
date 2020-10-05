class MerchantIngredient{
    constructor(ingredient, quantity){
        if(quantity < 0){
            banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER");
            return false;
        }
        
        this._quantity = quantity;
        this._ingredient = ingredient;
    }

    get ingredient(){
        return this._ingredient;
    }

    get quantity(){
        if(this._ingredient.specialUnit === "bottle"){
            return this._quantity / this._ingredient.unitSize;
        }

        switch(this._ingredient.unit){
            case "g":return this._quantity; 
            case "kg": return this._quantity / 1000;
            case "oz": return this._quantity / 28.3495;
            case "lb": return this._quantity / 453.5924;
            case "ml": return this._quantity * 1000;
            case "l": return this._quantity;
            case "tsp": return this._quantity * 202.8842;
            case "tbsp": return this._quantity * 67.6278;
            case "ozfl": return this._quantity * 33.8141;
            case "cup": return this._quantity * 4.1667;
            case "pt": return this._quantity * 2.1134;
            case "qt": return this._quantity * 1.0567;
            case "gal": return this._quantity / 3.7854;
            case "mm": return this._quantity * 1000;
            case "cm": return this._quantity * 100;
            case "m": return this._quantity;
            case "in": return this._quantity * 39.3701;
            case "ft": return this._quantity * 3.2808;
            default: return this._quantity;
        }
    }

    set quantity(quantity){
        if(quantity < 0){
            return false;
        }

        this._quantity = this.convertToBase(quantity);
    }

    convertToBase(quantity){
        switch(this._ingredient.unit){
            case "g": return quantity;
            case "kg": return quantity / 1000; 
            case "oz":  return quantity / 28.3495; 
            case "lb":  return quantity / 453.5924;
            case "ml": return quantity * 1000; 
            case "l": return quantity;
            case "tsp": return quantity * 202.8842; 
            case "tbsp": return quantity * 67.6278; 
            case "ozfl": return quantity * 33.8141; 
            case "cup": return quantity * 4.1667; 
            case "pt": return quantity * 2.1134; 
            case "qt": return quantity * 1.0567; 
            case "gal": return quantity / 3.7854;
            case "mm": return quantity * 1000; 
            case "cm": return quantity * 100; 
            case "m": return quantity;
            case "in": return quantity * 39.3701; 
            case "ft": return quantity * 3.2808;
            default: return quantity;
        }
    }

    getQuantityDisplay(){
        if(this._ingredient.specialUnit === "bottle"){
            return `${this.quantity.toFixed(2)} ${this._ingredient.specialUnit.toUpperCase()}`;
        }

        return `${this.quantity.toFixed(2)} ${this._ingredient.unit.toUpperCase()}`;
    }
}

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
        
        //populate ingredients
        for(let i = 0; i < oldMerchant.inventory.length; i++){
            const ingredient = new modules.Ingredient(
                oldMerchant.inventory[i].ingredient._id,
                oldMerchant.inventory[i].ingredient.name,
                oldMerchant.inventory[i].ingredient.category,
                oldMerchant.inventory[i].ingredient.unitType,
                oldMerchant.inventory[i].defaultUnit,
                this,
                oldMerchant.inventory[i].ingredient.specialUnit,
                oldMerchant.inventory[i].ingredient.unitSize
            );

            const merchantIngredient = new MerchantIngredient(
                ingredient,
                oldMerchant.inventory[i].quantity,
            );

            this._ingredients.push(merchantIngredient);
        }

        //populate recipes
        for(let i = 0; i < oldMerchant.recipes.length; i++){
            let ingredients = [];
            for(let j = 0; j < oldMerchant.recipes[i].ingredients.length; j++){
                const ingredient = oldMerchant.recipes[i].ingredients[j];
                for(let k = 0; k < this._ingredients.length; k++){
                    if(ingredient.ingredient === this._ingredients[k].ingredient.id){
                        ingredients.push({
                            ingredient: this._ingredients[k].ingredient,
                            quantity: ingredient.quantity
                        });
                        break;
                    }
                }
            }

            this._recipes.push(new this._modules.Recipe(
                oldMerchant.recipes[i]._id,
                oldMerchant.recipes[i].name,
                oldMerchant.recipes[i].price,
                ingredients,
                this
            ));
        }

        //populate transactions
        for(let i = 0; i < transactions.length; i++){
            this._transactions.push(new modules.Transaction(
                transactions[i]._id,
                transactions[i].date,
                transactions[i].recipes,
                this
            ));
        }
    }

    get modules(){
        return this._modules;
    }

    get name(){
        return this._name;
    }

    set name(name){
        if(this.isSanitaryString(name)){
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
        const merchantIngredient = new MerchantIngredient(ingredient, quantity);
        this._ingredients.push(merchantIngredient);

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
        if(index === undefined){
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
        if(from === 0){
            from = this._transactions[0].date;
        }

        const {start, end} = this.getTransactionIndices(from, to);

        return this._transactions.slice(start, end);
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
            from = this._transactions[0].date;
        }
        const {start, end} = this.getTransactionIndices(from, to);

        let total = 0;
        for(let i = start; i <= end; i++){
            for(let j = 0; j < this._transactions[i].recipes.length; j++){
                for(let k = 0; k < this.recipes.length; k++){
                    if(this._transactions[i].recipes[j].recipe === this.recipes[k]){
                        total += this._transactions[i].recipes[j].quantity * this.recipes[k].price;
                    }
                }
            }
        }

        return total / 100;
    }

    /*
    Gets the quantity of each ingredient sold between two dates (dateRange)
    Inputs:
        dateRange: list containing a start date and an end date
    Return:
        [{
            ingredient: Ingredient object,
            quantity: quantity of ingredient sold in default unit
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
    Gets the quantity of a single ingredient sold between two dates
    Inputs:
        ingredient = MerchantIngredient object to find
        from = start Date
        to = end Date
    return: quantity sold in default unit
    */
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
                    break;
                }
            }
        }

        return recipes;
    }

    getTransactionIndices(from, to){
        let start, end;
        to.setDate(to.getDate() + 1);

        for(let i = this._transactions.length - 1; i >= 0; i--){
            if(this._transactions[i].date >= from){
                start = i;
                break;
            }
        }
        
        for(let i = 0; i < this._transactions.length; i++){
            if(this._transactions[i].date < to){
                end = i;
                break;
            }
        }

        if(start === undefined){
            return false;
        }

        //these are switched due to the order of the transactions in the merchant
        return {start: end, end: start};
    }

    isSanitaryString(str){
        let disallowed = ["\\", "<", ">", "$", "{", "}", "(", ")"];

        for(let i = 0; i < disallowed.length; i++){
            if(str.includes(disallowed[i])){
                return false;
            }
        }

        return true;
    }
}

module.exports = Merchant;