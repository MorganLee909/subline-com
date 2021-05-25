const Ingredient = require("./Ingredient.js");
const Recipe = require("./Recipe.js");
const Transaction = require("./Transaction.js");
const Order = require("./Order.js");

class MerchantIngredient{
    constructor(ingredient, quantity, parent){
        this._quantity = quantity;
        this._ingredient = ingredient;
        this._parent = parent;
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

    set quantity(quantity){
        this._quantity = quantity;
    }

    updateQuantity(quantity){
        this._quantity += controller.baseUnit(quantity, this._ingredient.unit);
    }

    getQuantityDisplay(){
        return `${this.quantity.toFixed(2)} ${this._ingredient.unit.toUpperCase()}`;
    }

    /*
    Gets the quantity of a single ingredient sold between two dates
    Inputs:
        from = start Date
        to = end Date
    return: quantity sold in default unit
    */
    getSoldQuantity(from, to){
        let total = 0;
        const {start, end} = this._parent.getTransactionIndices(from, to);

        for(let i = start; i < end; i++){
            total += this._parent.transactions[i].getIngredientQuantity(this._ingredient);
        }

        return total;
    }
}

class Merchant{
        constructor(
            name,
            pos,
            ingredients,
            recipes,
            transactions,
            address,
            owner
        ){
        this._name = name;
        this._pos = pos;
        this._inventory = [];
        this._recipes = [];
        this._transactions = [];
        this._orders = [];
        this._address = address;
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
                ingredients[i].ingredient.unitSize
            );

            const merchantIngredient = new MerchantIngredient(
                ingredient,
                ingredients[i].quantity,
                this
            );

            this._inventory.push(merchantIngredient);
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
                for(let k = 0; k < this._inventory.length; k++){
                    if(ingredient.ingredient === this._inventory[k].ingredient.id){
                        ingredients.push({
                            ingredient: this._inventory[k].ingredient.id,
                            quantity: ingredient.quantity
                        });
                        break;
                    }
                }
            }

            let newRecipe = new Recipe(
                recipes[i]._id,
                recipes[i].name,
                recipes[i].price,
                ingredients,
                this,
                recipes[i].hidden
            );

            newRecipe.calculateIngredientTotals();
            this._recipes.push(newRecipe);
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

        //populate orders
        let from = new Date();
        from.setDate(from.getDate() - 30);
        let data = {
            from: from,
            to: new Date(),
            ingredients: []
        };

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/orders/get", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    this.addOrders(response);
                    state.updateOrders(this._orders);
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
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

    get inventory(){
        return this._inventory;
    }

    get address(){
        return this._address;
    }

    set address(address){
        this._address = address;
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
            );

            createdIngredient.replaceIngredients(ingredient.ingredients);

            const merchantIngredient = new MerchantIngredient(createdIngredient, quantity, this);
            this._inventory.push(merchantIngredient);
        }
    }

    removeIngredient(ingredient){
        const index = this._inventory.indexOf(ingredient);
        if(index === undefined) return false;

        this._inventory.splice(index, 1);
    }

    updateIngredients(ingredients){
        for(let i = 0; i < ingredients.length; i++){
            let inventoryItem = this.getIngredient(ingredients[i].ingredient._id);

            inventoryItem.quantity = ingredients[i].quantity;
            inventoryItem.ingredient.id = ingredients[i].ingredient._id;
            inventoryItem.ingredient.name = ingredients[i].ingredient.name;
            inventoryItem.ingredient.unitType = ingredients[i].ingredient.unitType;
            inventoryItem.ingredient.unit = ingredients[i].defaultUnit;
            inventoryItem.ingredient.unitSize = ingredients[i].ingredient.unitSize;
            inventoryItem.ingredient.addIngredients(ingredients[i].ingredient.ingredients);
        }
    }

    getIngredient(id){
        for(let i = 0; i < this._inventory.length; i++){
            if(this._inventory[i].ingredient.id === id) return this._inventory[i];
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
            let newRecipe = new Recipe(
                recipes[i]._id,
                recipes[i].name,
                recipes[i].price,
                recipes[i].ingredients,
                this,
                recipes[i].hidden
            );

            newRecipe.calculateIngredientTotals();
            this._recipes.push(newRecipe);
        }
    }

    removeRecipe(recipe){
        const index = this._recipes.indexOf(recipe);
        if(index === undefined) return false;

        this._recipes.splice(index, 1);

        state.updateRecipes();
    }

    get transactions(){
        return this._transactions;
    }

    getTransactions(from, to){
        if(merchant._transactions.length <= 0) return [];

        const {start, end} = this.getTransactionIndices(from, to);

        return this._transactions.slice(start, end);
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
            for(let j = 0; j < this._inventory.length; j++){
                if(order.ingredients[i].ingredient === this._inventory[j].ingredient){
                    this._inventory[j].updateQuantity(-order.ingredients[i].quantity);
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
        for(let i = start; i < end; i++){
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
        if(from === 0) from = this._transactions[0].date;

        const {start, end} = this.getTransactionIndices(from, to);

        let recipeList = [];
        for(let i = start; i < end; i++){
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

        for(let i = 0; i < this._inventory.length; i++){
            let categoryExists = false;
            for(let j = 0; j < ingredientsByCategory.length; j++){
                if(this._inventory[i].ingredient.category === ingredientsByCategory[j].name){
                    ingredientsByCategory[j].ingredients.push(this._inventory[i]);

                    categoryExists = true;
                    break;
                }
            }

            if(!categoryExists){
                ingredientsByCategory.push({
                    name: this._inventory[i].ingredient.category,
                    ingredients: [this._inventory[i]]
                });
            }
        }

        return ingredientsByCategory;
    }

    getTransactionIndices(from, to){
        let start = 0;
        let end = 0;

        if(
            this._transactions.length === 0 ||
            from > this._transactions[0].date ||
            to >= this._transactions[this._transactions.length-1].date
        ){
            for(let i = this._transactions.length - 1; i >= 0; i--){
                if(this._transactions[i].date > from){
                    end = i + 1;
                    break;
                }
            }
        
            for(let i = 0; i < this._transactions.length; i++){
                if(this._transactions[i].date <= to){
                    start = i;
                    break;
                }
            }
        }
        return {start: start, end: end};
    }
}

module.exports = Merchant;