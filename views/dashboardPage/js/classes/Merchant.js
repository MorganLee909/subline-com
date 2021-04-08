const Ingredient = require("./Ingredient.js");
const Recipe = require("./Recipe.js");
const Transaction = require("./Transaction.js");
const Order = require("./Order.js");

class MerchantIngredient{
    constructor(ingredient, quantity){
        this._quantity = quantity;
        this._ingredient = ingredient;
    }

    get ingredient(){
        return this._ingredient;
    }

    get quantity(){
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

    updateQuantity(quantity){
        this._quantity += this.convertToBase(quantity);
    }

    convertToBase(quantity){
        switch(this._ingredient.unit){
            case "g": return quantity;
            case "kg": return quantity * 1000;
            case "oz":  return quantity * 28.3495; 
            case "lb":  return quantity * 453.5924;
            case "ml": return quantity / 1000; 
            case "l": return quantity;
            case "tsp": return quantity / 202.8842; 
            case "tbsp": return quantity / 67.6278; 
            case "ozfl": return quantity / 33.8141; 
            case "cup": return quantity / 4.1667; 
            case "pt": return quantity / 2.1134; 
            case "qt": return quantity / 1.0567; 
            case "gal": return quantity * 3.7854;
            case "mm": return quantity / 1000; 
            case "cm": return quantity / 100; 
            case "m": return quantity;
            case "in": return quantity / 39.3701; 
            case "ft": return quantity / 3.2808;
            default: return quantity;
        }
    }

    getQuantityDisplay(){
        return `${this.quantity.toFixed(2)} ${this._ingredient.unit.toUpperCase()}`;
    }
}

class Merchant{
        constructor(
            name,
            pos,
            ingredients,
            recipes,
            transactions,
            owner
        ){
        this._name = name;
        this._pos = pos;
        this._ingredients = [];
        this._recipes = [];
        this._transactions = [];
        this._orders = [];
        this._owner = {
            id: owner._id,
            email: owner.email,
            merchants: owner.merchants,
            name: owner.name
        };
        
        //populate ingredients
        for(let i = 0; i < ingredients.length; i++){
            const ingredient = new Ingredient(
                ingredients[i].ingredient._id,
                ingredients[i].ingredient.name,
                ingredients[i].ingredient.category,
                ingredients[i].ingredient.unitType,
                ingredients[i].defaultUnit,
                this,
                ingredients[i].ingredient.unitSize,
            );

            const merchantIngredient = new MerchantIngredient(
                ingredient,
                ingredients[i].quantity,
            );

            this._ingredients.push(merchantIngredient);
        }

        for(let i = 0; i < ingredients.length; i++){
            let thisIngredient = this.getIngredient(ingredients[i].ingredient._id);
            thisIngredient.ingredient.addIngredients(ingredients[i].ingredient.ingredients);
        }

        //populate recipes
        for(let i = 0; i < recipes.length; i++){
            let ingredients = [];
            for(let j = 0; j < recipes[i].ingredients.length; j++){
                const ingredient = recipes[i].ingredients[j];
                for(let k = 0; k < this._ingredients.length; k++){
                    if(ingredient.ingredient === this._ingredients[k].ingredient.id){
                        ingredients.push({
                            ingredient: this._ingredients[k].ingredient.id,
                            quantity: ingredient.quantity
                        });
                        break;
                    }
                }
            }

            this._recipes.push(new Recipe(
                recipes[i]._id,
                recipes[i].name,
                recipes[i].price,
                ingredients,
                this
            ));
        }

        //populate transactions
        for(let i = 0; i < transactions.length; i++){
            this._transactions.push(new Transaction(
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
        this._name = name;
    }

    get email(){
        return this._email;
    }

    set email(email){
        this._email = email;
    }

    get pos(){
        return this._pos;
    }

    get ingredients(){
        return this._ingredients;
    }

    /*
    ingredient: [{
        ingredient: {
            _id: String,
            name: String,
            category: String,
            unitType: String,
            specialUnit: String || undefined,
            unitSize: Number || undefined
        }
        quantity: Number
        defaultUnit: String
    }]
    */
    addIngredients(ingredients){
        for(let i = 0; i < ingredients.length; i++){
            let ingredient = ingredients[i].ingredient;
            let quantity = ingredients[i].quantity;
            let defaultUnit = ingredients[i].defaultUnit;

            const createdIngredient = new Ingredient(
                ingredient._id,
                ingredient.name,
                ingredient.category,
                ingredient.unitType,
                defaultUnit,
                this,
                ingredient.unitSize,
                ingredient.ingredients
            );

            const merchantIngredient = new MerchantIngredient(createdIngredient, quantity);
            this._ingredients.push(merchantIngredient);
        }
    }

    removeIngredient(ingredient){
        const index = this._ingredients.indexOf(ingredient);
        if(index === undefined) return false;

        this._ingredients.splice(index, 1);
    }

    getIngredient(id){
        for(let i = 0; i < this._ingredients.length; i++){
            if(this._ingredients[i].ingredient.id === id) return this._ingredients[i];
        }
    }

    get recipes(){
        return this._recipes;
    }

    getRecipe(id){
        for(let i = 0; i < this._recipes.length; i++){
            if(this._recipes[i].id === id) return this._recipes[i];
        }
    }

    /*
    recipes: [{
        _id: String
        name: String
        price: Number
        ingredients: [{
            ingredient: String (id)
            quantity: Number
        }]
    }]
    */
    addRecipes(recipes){
        for(let i = 0; i < recipes.length; i++){
            this._recipes.push(new Recipe(
                recipes[i]._id,
                recipes[i].name,
                recipes[i].price,
                recipes[i].ingredients,
                this
            ));
        }
    }

    removeRecipe(recipe){
        const index = this._recipes.indexOf(recipe);
        if(index === undefined){
            return false;
        }

        this._recipes.splice(index, 1);

        state.updateRecipes();
    }

    get transactions(){
        return this._transactions;
    }

    getTransactions(from = 0, to = new Date()){
        if(merchant._transactions.length <= 0){
            return [];
        }

        if(from === 0){
            from = this._transactions[this._transactions.length-1].date;
        }

        const {start, end} = this.getTransactionIndices(from, to);

        return this._transactions.slice(start, end + 1);
    }

    /*
    transactions: [{
        _id: String,
        date: String (date)
        recipes: [{
            recipe: String (id)
            quantity: Number
        }]
    }]
    */
    addTransactions(transactions, isNew = false){
        for(let i = 0; i < transactions.length; i++){
            let transaction = new Transaction(
                transactions[i]._id,
                transactions[i].date,
                transactions[i].recipes,
                this
            );

            this._transactions.push(transaction);

            if(isNew === true){
                for(let j = 0; j < transaction.recipes.length; j++){
                    let recipe = transaction.recipes[j].recipe;
                    for(let k = 0; k < recipe.ingredients.length; k++){
                        let ingredient = recipe.ingredients[k].ingredient;
                        let quantity = transaction.recipes[j].quantity * recipe.ingredients[k].quantity;

                        this.getIngredient(ingredient.id).updateQuantity(-quantity);
                    }
                }
            }
        }

        this.transactions.sort((a, b) => (a.date > b.date) ? 1 : -1);
    }

    removeTransaction(transaction){
        for(let j = 0; j < transaction.recipes.length; j++){
            let recipe = transaction.recipes[j].recipe;
            for(let k = 0; k < recipe.ingredients.length; k++){
                let ingredient = recipe.ingredients[k].ingredient;
                let quantity = transaction.recipes[j].quantity * recipe.ingredients[k].quantity;

                this.getIngredient(ingredient.id).updateQuantity(quantity);
            }
        }

        this._transactions.splice(this._transactions.indexOf(transaction), 1);

        state.updateTransactions();
    }

    get orders(){
        return this._orders;
    }

    clearOrders(){
        this._orders = [];
    }

    /*
    orders: [{
        _id: String,
        name: String,
        date: String (date)
        taxes: Number
        fees: Number
        ingredients: [{
            ingredient: String (id),
            pricePerUnit: Number
            quantity: Number
        }]
    }]
    */
    addOrders(orders, isNew = false){
        for(let i = 0; i < orders.length; i++){
            let order = new Order(
                orders[i]._id,
                orders[i].name,
                orders[i].date,
                orders[i].taxes,
                orders[i].fees,
                orders[i].ingredients,
                this
            );

            this._orders.push(order);

            if(isNew === true){
                for(let j = 0; j < order.ingredients.length; j++){
                    this.getIngredient(order.ingredients[j].ingredient.id).updateQuantity(order.ingredients[j].quantity);
                }
            }
        }
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
                    this._ingredients[j].updateQuantity(-order.ingredients[i].quantity);
                    break;
                }
            }
        }
    }

    get units(){
        return this._units;
    }

    get owner(){
        return this._owner;
    }

    getRevenue(from, to = new Date()){
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

        return total;
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
    getIngredientsSold(from, to = new Date()){
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

    /*
    Gets the quantity of a single ingredient sold between two dates
    Inputs:
        ingredient = MerchantIngredient object to find
        from = start Date
        to = end Date
    return: quantity sold in default unit
    */
    getSingleIngredientSold(ingredient, from, to = new Date()){
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
        if(from === 0){
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
        ingredients: [MerchantIngredient Object]
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
        
        for(let i = this._transactions.length - 1; i >= 0; i--){
            if(this._transactions[i].date >= from){
                end = i;
                break;
            }
        }
        
        for(let i = 0; i < this._transactions.length; i++){
            if(this._transactions[i].date < to){
                start = i;
                break;
            }
        }

        if(end === undefined){
            return false;
        }

        return {start: start, end: end};
    }
}

module.exports = Merchant;