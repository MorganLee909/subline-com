const Ingredient = require("./Ingredient.js");
const Recipe = require("./Recipe.js");
const Transaction = require("./Transaction.js");
const Order = require("./Order.js");

class MerchantIngredient{
    constructor(ingredient, quantity, parent){
        this._quantity = quantity;
        this.ingredient = ingredient;
        this.parent = parent;
    }

    get quantity(){
        let convertMultiplier = 1;
        switch(controller.getUnitType(this.ingredient.unit)){
            case "mass":
                convertMultiplier = this.ingredient.convert.toMass;
                break;
            case "volume":
                convertMultiplier = this.ingredient.convert.toVolume;
                break;
            case "length":
                convertMultiplier = this.ingredient.convert.toLength;
                break;
            case "bottle":
                return this._quantity * this.ingredient.convert.toBottle;
        }
        
        return this._quantity * controller.unitMultiplier(controller.getBaseUnit(this.ingredient.unit), this.ingredient.unit) * convertMultiplier;
    }

    set quantity(quantity){
        this._quantity = quantity;
    }

    /*
    Takes in quantity and unit of that quantity and subtracts from the quantity on the ingredient
    quantity: Number
    unit: String
    */
    updateQuantity(quantity, unit){
        quantity *= controller.unitMultiplier(unit, controller.getBaseUnit(unit))
        switch(controller.getUnitType(this.ingredient.unit)){
            case "mass": quantity /= this.ingredient.convert.toMass; break;
            case "volume": quantity /= this.ingredient.convert.toVolume; break;
            case "length": quantity /= this.ingredient.convert.toLength; break;
        }
        this._quantity += quantity;
    }

    getQuantityDisplay(){
        return `${this.quantity.toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
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
        const {start, end} = this.parent.getTransactionIndices(from, to);

        for(let i = start; i < end; i++){
            total += this.parent.transactions[i].getIngredientQuantity(this.ingredient);
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
            owner,
            id
        ){
        this.name = name;
        this.pos = pos;
        this.inventory = [];
        this.recipes = [];
        this.transactions = [];
        this.orders = [];
        this.address = address;
        this.owner = {
            id: owner._id,
            email: owner.email,
            merchants: owner.merchants,
            name: owner.name
        };
        this.id = id;
        
        //populate ingredients
        for(let i = 0; i < ingredients.length; i++){
            const ingredient = new Ingredient(
                ingredients[i].ingredient._id,
                ingredients[i].ingredient.name,
                ingredients[i].ingredient.category,
                ingredients[i].ingredient.unit,
                ingredients[i].ingredient.altUnit,
                ingredients[i].ingredient.ingredients,
                ingredients[i].ingredient.convert,
                this
            );

            const merchantIngredient = new MerchantIngredient(
                ingredient,
                ingredients[i].quantity,
                this
            );

            this.inventory.push(merchantIngredient);
        }

        //populate recipes
        for(let i = 0; i < recipes.length; i++){
            let ingredients = [];
            for(let j = 0; j < recipes[i].ingredients.length; j++){
                const ingredient = recipes[i].ingredients[j];
                for(let k = 0; k < this.inventory.length; k++){
                    if(ingredient.ingredient === this.inventory[k].ingredient.id){
                        ingredients.push({
                            ingredient: this.inventory[k].ingredient.id,
                            quantity: ingredient.quantity,
                            unit: ingredient.unit,
                            baseUnitMultiplier: ingredient.baseUnitMultiplier
                        });
                        break;
                    }
                }
            }

            let newRecipe = new Recipe(
                recipes[i]._id,
                recipes[i].name,
                recipes[i].category,
                recipes[i].price,
                ingredients,
                this,
                recipes[i].hidden
            );

            this.recipes.push(newRecipe);
        }

        //populate transactions
        for(let i = 0; i < transactions.length; i++){
            this.transactions.push(new Transaction(
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
                    state.updateOrders(this.orders);
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }

    /*
    ingredient: [{
        ingredient: {
            _id: String,
            name: String,
            category: String,
            specialUnit: String || undefined,
        }
        quantity: Number
        defaultUnit: String
    }]
    */
    addIngredients(ingredients){
        for(let i = 0; i < ingredients.length; i++){
            let ingredient = ingredients[i].ingredient;
            let quantity = ingredients[i].quantity;
            let unit = ingredients[i].ingredient.unit;

            const createdIngredient = new Ingredient(
                ingredient._id,
                ingredient.name,
                ingredient.category,
                unit,
                ingredients[i].ingredient.altUnit,
                ingredient.ingredients,
                ingredient.convert,
                this
            );

            const merchantIngredient = new MerchantIngredient(createdIngredient, quantity, this);
            this.inventory.push(merchantIngredient);
        }
    }

    removeIngredient(ingredient){
        const index = this.inventory.indexOf(ingredient);
        if(index === undefined) return false;

        for(let i = 0; i < this.inventory.length; i++){
            for(let j = 0; j < this.inventory[i].ingredient.subIngredients.length; j++){
                let subIngredients = this.inventory[i].ingredient.subIngredients;

                if(subIngredients[j].ingredient === ingredient.ingredient){
                    subIngredients.splice(j, 1);
                    break;
                }
            }
        }

        this.inventory.splice(index, 1);
    }

    updateIngredients(ingredients){
        for(let i = 0; i < ingredients.length; i++){
            let inventoryItem = this.getIngredient(ingredients[i].ingredient._id);

            inventoryItem.quantity = ingredients[i].quantity;
            inventoryItem.ingredient.id = ingredients[i].ingredient._id;
            inventoryItem.ingredient.name = ingredients[i].ingredient.name;
            inventoryItem.ingredient.unit = ingredients[i].ingredient.unit;
            inventoryItem.ingredient.addIngredients(ingredients[i].ingredient.ingredients);
        }
    }

    getIngredient(id){
        for(let i = 0; i < this.inventory.length; i++){
            if(this.inventory[i].ingredient.id === id) return this.inventory[i];
        }
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

        for(let i = 0; i < this.inventory.length; i++){
            let categoryExists = false;
            for(let j = 0; j < ingredientsByCategory.length; j++){
                if(this.inventory[i].ingredient.category === ingredientsByCategory[j].name){
                    ingredientsByCategory[j].ingredients.push(this.inventory[i]);

                    categoryExists = true;
                    break;
                }
            }

            if(!categoryExists){
                ingredientsByCategory.push({
                    name: this.inventory[i].ingredient.category,
                    ingredients: [this.inventory[i]]
                });
            }
        }

        return ingredientsByCategory;
    }

    getRecipe(id){
        for(let i = 0; i < this.recipes.length; i++){
            if(this.recipes[i].id === id) return this.recipes[i];
        }

        return new Recipe(
            "",
            "Deleted Recipe",
            "",
            0,
            [],
            undefined,
            true
        );
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
                recipes[i].category,
                recipes[i].price,
                recipes[i].ingredients,
                this,
                recipes[i].hidden
            );

            newRecipe.calculateIngredientTotals();
            this.recipes.push(newRecipe);
        }
    }

    /*
    Updates a single recipe
    recipe: Recipe
    updates: Object
    */
    updateRecipe(recipe, updates){
        recipe.name = updates.name;
        recipe.category = updates.category;
        recipe.hidden = updates.category;
        recipe.price = updates.price;

        recipe.clearIngredients();
        for(let i = 0; i < updates.ingredients.length; i++){
            newIngredient = this.getIngredient(updates.ingredients[i].ingredient);
            recipe.addIngredient(
                newIngredient.ingredient, 
                updates.ingredients[i].quantity,
                updates.ingredients[i].unit,
                updates.ingredients[i].baseUnitMultiplier
            );
        }

        recipe.calculateIngredientTotals();
    }

    removeRecipe(recipe){
        const index = this.recipes.indexOf(recipe);
        if(index === undefined) return false;

        this.recipes.splice(index, 1);
    }

    /*
    Groups recipes by their categories
    return: [{
        name: String,
        recipes: [Recipe]
    }]
    */
    categorizeRecipes(){
        let categories = [];

        for(let i = 0; i < this.recipes.length; i++){
            let exists = false;
            for(let j = 0; j < categories.length; j++){
                if(this.recipes[i].category === categories[j].name){
                    categories[j].recipes.push(this.recipes[i]);
                    exists = true;
                    break;
                }
            }

            if(exists === false){
                categories.push({
                    name: this.recipes[i].category,
                    recipes: [this.recipes[i]]
                });
            }
        }

        return categories;
    }

    getTransactions(from, to){
        if(merchant.transactions.length <= 0) return [];

        const {start, end} = this.getTransactionIndices(from, to);

        return this.transactions.slice(start, end);
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

            this.transactions.push(transaction);

            if(isNew === true){
                for(let j = 0; j < transaction.recipes.length; j++){
                    let recipe = transaction.recipes[j].recipe;
                    for(let k = 0; k < recipe.ingredients.length; k++){
                        let ingredient = recipe.ingredients[k].ingredient;
                        let quantity = transaction.recipes[j].quantity * recipe.ingredients[k]._quantity;

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

        this.transactions.splice(this.transactions.indexOf(transaction), 1);

        state.updateTransactions();
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

            this.orders.push(order);

            if(isNew === true){
                for(let j = 0; j < order.ingredients.length; j++){
                    this.getIngredient(order.ingredients[j].ingredient.id).updateQuantity(order.ingredients[j].quantity);
                }
            }
        }
    }

    removeOrder(order){
        const index = this.orders.indexOf(order);
        if(index === undefined){
            return false;
        }

        this.orders.splice(index, 1);

        for(let i = 0; i < order.ingredients.length; i++){
            for(let j = 0; j < this.inventory.length; j++){
                if(order.ingredients[i].ingredient === this.inventory[j].ingredient){
                    this.inventory[j].updateQuantity(-order.ingredients[i].quantity);
                    break;
                }
            }
        }
    }

    getRevenue(from, to = new Date()){
        const {start, end} = this.getTransactionIndices(from, to);

        let total = 0;
        for(let i = start; i < end; i++){
            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                for(let k = 0; k < this.recipes.length; k++){
                    if(this.transactions[i].recipes[j].recipe === this.recipes[k]){
                        total += this.transactions[i].recipes[j].quantity * this.recipes[k].price;
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
        if(from === 0) from = this.transactions[0].date;

        const {start, end} = this.getTransactionIndices(from, to);

        let recipeList = [];
        for(let i = start; i < end; i++){
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

    getTransactionIndices(from, to){
        let start = 0;
        let end = 0;

        if(
            this.transactions.length === 0 ||
            from > this.transactions[0].date ||
            to >= this.transactions[this.transactions.length-1].date
        ){
            for(let i = this.transactions.length - 1; i >= 0; i--){
                if(this.transactions[i].date > from){
                    end = i + 1;
                    break;
                }
            }
        
            for(let i = 0; i < this.transactions.length; i++){
                if(this.transactions[i].date <= to){
                    start = i;
                    break;
                }
            }
        }
        return {start: start, end: end};
    }
}

module.exports = Merchant;