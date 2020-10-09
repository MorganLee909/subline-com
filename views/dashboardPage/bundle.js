(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class Ingredient{
    constructor(id, name, category, unitType, unit, parent, specialUnit = undefined, unitSize = undefined){
        if(!this.isSanitaryString(name)){
            banner.createError("NAME CONTAINS ILLEGAL CHARCTERS");
            return false;
        }
        if(!this.isSanitaryString(category)){
            banner.createError("CATEGORY CONTAINS ILLEGAL CHARACTERS");
            return false;
        }

        this._id = id;
        this._name = name;
        this._category = category;
        this._unitType = unitType;
        this._unit = unit;
        this._parent = parent;
        if(specialUnit){
            this._specialUnit = specialUnit;
            this._unitSize = unitSize;
        }
    }

    get id(){
        return this._id;
    }

    get name(){
        return this._name;
    }

    set name(name){
        if(!this.isSanitaryString(name)){
            return false;
        }

        this._name = name;
    }

    get category(){
        return this._category;
    }

    set category(category){
        if(!this.isSanitaryString(category)){
            return false;
        }

        this._category = category;
    }

    get unitType(){
        return this._unitType;
    }

    get unit(){
        return this._unit;
    }

    set unit(unit){
        this._unit = unit;
    }

    get parent(){
        return this._parent;
    }

    get specialUnit(){
        return this._specialUnit;
    }

    get unitSize(){
        switch(this._unit){
            case "g":return this._unitSize; 
            case "kg": return this._unitSize / 1000;
            case "oz": return this._unitSize / 28.3495;
            case "lb": return this._unitSize / 453.5924;
            case "ml": return this._unitSize * 1000;
            case "l": return this._unitSize;
            case "tsp": return this._unitSize * 202.8842;
            case "tbsp": return this._unitSize * 67.6278;
            case "ozfl": return this._unitSize * 33.8141;
            case "cup": return this._unitSize * 4.1667;
            case "pt": return this._unitSize * 2.1134;
            case "qt": return this._unitSize * 1.0567;
            case "gal": return this._unitSize / 3.7854;
            case "mm": return this._unitSize * 1000;
            case "cm": return this._unitSize * 100;
            case "m": return this._unitSize;
            case "in": return this._unitSize * 39.3701;
            case "ft": return this._unitSize * 3.2808;
            default: return this._unitSize;
        }
    }

    set unitSize(unitSize){
        if(unitSize < 0){
            return false;
        }

        this._unitSize = unitSize;
    }

    getNameAndUnit(){
        if(this._specialUnit === "bottle"){
            return `${this._name} (BOTTLES)`;
        }

        return `${this._name} (${this._unit.toUpperCase()})`;
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

module.exports = Ingredient;
},{}],2:[function(require,module,exports){
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
            return this._quantity / this._ingredient._unitSize;
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

        this._quantity = quantity;
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
        if(this._ingredient.specialUnit === "bottle"){
            return `${this.quantity.toFixed(2)} BOTTLES`;
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

    getIngredient(id){
        for(let i = 0; i < this._ingredients.length; i++){
            if(this._ingredients[i].ingredient.id === id){
                return this._ingredients[i].ingredient;
            }
        }
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

    /*
    recipe = {
        name: required,
        price: required,
        ingredients: [{
            ingredient: id of ingredient,
            quantity: quantity of ingredient
        }]
    }
    */
    updateRecipe(recipe){
        for(let i = 0; i < this._recipes.length; i++){
            if(this._recipes[i].id === recipe._id){
                this._recipes[i].name = recipe.name;
                this._recipes[i].price = recipe.price;
                
                this._recipes[i].removeIngredients();
                for(let j = 0; j < recipe.ingredients.length; j++){
                    for(let k = 0; k < this._ingredients.length; k++){
                        if(this._ingredients[k].ingredient.id === recipe.ingredients[j].ingredient){
                            this._recipes[i].addIngredient(
                                this._ingredients[k].ingredient,
                                recipe.ingredients[j].quantity
                            );

                            break;
                        }
                    }
                }

                break;
            }
        }

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
},{}],3:[function(require,module,exports){
class OrderIngredient{
    constructor(ingredient, quantity, pricePerUnit){
        if(quantity < 0){
            return false;
        }
        this._ingredient = ingredient;
        this._quantity = quantity;
        this._pricePerUnit = pricePerUnit;
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

    convertToBase(quantity){
        switch(this._ingredient.unit){
            case "g": return quantity;
            case "kg": return quantity / 1000; 
            case "oz":  return quantity / 28.3495; 
            case "lb":  return quantity / 453.5924;
            case "ml": return quantity *= 1000; 
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

    get pricePerUnit(){
        if(this._ingredient.specialUnit === "bottle"){
            return price * this._ingredient.unitSize;
        }

        switch(this._ingredient.unit){
            case "g": return this._pricePerUnit;
            case "kg": return this._pricePerUnit * 1000; 
            case "oz": return this._pricePerUnit * 28.3495; 
            case "lb": return this._pricePerUnit * 453.5924; 
            case "ml": return this._pricePerUnit / 1000; 
            case "l": return this._pricePerUnit;
            case "tsp": return this._pricePerUnit / 202.8842; 
            case "tbsp": return this._pricePerUnit / 67.6278; 
            case "ozfl": return this._pricePerUnit / 33.8141; 
            case "cup": return this._pricePerUnit / 4.1667; 
            case "pt": return this._pricePerUnit / 2.1134; 
            case "qt": return this._pricePerUnit / 1.0567; 
            case "gal": return this._pricePerUnit * 3.7854; 
            case "mm": return this._pricePerUnit / 1000; 
            case "cm": return this._pricePerUnit / 100; 
            case "m": return this._pricePerUnit;
            case "in": return this._pricePerUnit / 39.3701; 
            case "ft": return this._pricePerUnit / 3.2808; 
        }
    }

    cost(){
        return this._quantity * this._pricePerUnit;
    }
        
}

/*
Order Object
id = id of order in the database
name = name/id of order, if any
date = Date Object for when the order was created
taxes = User entered taxes associated with the order
fees = User entered fees associated with the order
ingredients = [{
    ingredient: Ingredient Object,
    quantity: quantity of ingredient sold,
    pricePerUnit: price of purchase (per base unit)
}]
parent = the merchant that it belongs to
*/
class Order{
    constructor(id, name, date, taxes, fees, ingredients, parent){
        if(!this.isSanitaryString(name)){
            return false;
        }
        if(taxes < 0){
            return false;
        }

        this._id = id;
        this._name = name;
        this._date = new Date(date);
        this._taxes = taxes;
        this._fees = fees;
        this._ingredients = [];
        this._parent = parent;

        if(date > new Date()){
            return false;
        }

        for(let i = 0; i < ingredients.length; i++){
            this._ingredients.push(new OrderIngredient(
                ingredients[i].ingredient,
                ingredients[i].quantity,
                ingredients[i].pricePerUnit
            ));
        }

        this._parent.modules.ingredients.isPopulated = false;
    }

    get id(){
        return this._id;
    }

    get name(){
        return this._name;
    }

    get date(){
        return this._date;
    }

    get taxes(){
        return this._taxes;
    }

    get fees(){
        return this._fees;
    }

    get parent(){
        return this._parent;
    }

    get ingredients(){
        return this._ingredients;
    }

    getIngredientCost(){
        let sum = 0;
        for(let i = 0; i < this._ingredients.length; i++){
            sum += this._ingredients[i].cost();
        }

        return sum;
    }

    getTotalCost(){
        return this.getIngredientCost() + this._taxes + this._fees;
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

module.exports = Order;
},{}],4:[function(require,module,exports){
class RecipeIngredient{
    constructor(ingredient, quantity){
        if(quantity < 0){
            banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER");
            return false;
        }
        this._ingredient = ingredient;
        this._quantity = quantity;
    }

    get ingredient(){
        return this._ingredient;
    }

    get quantity(){
        // if(this._ingredient.specialUnit === "bottle"){
        //     return this._quantity / this._ingredient.unitSize;
        // }

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
            banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER");
            return false;
        }

        this_quantity = this.convertToBase(quantity);
    }

    getQuantityDisplay(){
        if(this._ingredient.specialUnit === "bottle"){
            
            return `${this.quantity.toFixed(2)} BOTTLES`;
        }

        return `${this.quantity.toFixed(2)} ${this._ingredient.unit.toUpperCase()}`;
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
}

/*
Recipe Object
id = database id of recipe
name = name of recipe
price = price of recipe in cents
ingredients = [{
    ingredient: Ingredient Object,
    quantity: quantity of the ingredient within the recipe (stored as base unit, i.e grams)
}]
parent = merchant that it belongs to
*/
class Recipe{
    constructor(id, name, price, ingredients, parent){
        if(price < 0){
            banner.createError("PRICE CANNOT BE A NEGATIVE NUMBER");
            return false;
        }
        if(!this.isSanitaryString(name)){
            banner.createError("NAME CONTAINS ILLEGAL CHARACTERS");
            return false;
        }
        this._id = id;
        this._name = name;
        this._price = price;
        this._parent = parent;
        this._ingredients = [];

        for(let i = 0; i < ingredients.length; i++){
            const recipeIngredient = new RecipeIngredient(
                ingredients[i].ingredient,
                ingredients[i].quantity
            );

            this._ingredients.push(recipeIngredient);
        }

        this._parent.modules.recipeBook.isPopulated = false;
        this._parent.modules.analytics.isPopulated = false;
    }

    get id(){
        return this._id;
    }

    get name(){
        return this._name;
    }

    set name(name){
        if(!this.isSanitaryString(name)){
            return false;
        }

        this._name = name;
    }

    get price(){
        return this._price / 100;
    }

    set price(price){
        if(price < 0){
            return false;
        }

        this._price = price;
    }

    get parent(){
        return this._parent;
    }

    get ingredients(){
        return this._ingredients;
    }

    addIngredient(ingredient, quantity){
        if(quantity < 0){
            banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER");
            return false;
        }

        let recipeIngredient = new RecipeIngredient(ingredient, quantity);
        this._ingredients.push(recipeIngredient);

        this._parent.modules.recipeBook.isPopulated = false;
        this._parent.modules.analytics.isPopulated = false;
    }

    removeIngredients(){
        this._ingredients = [];
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

module.exports = Recipe;
},{}],5:[function(require,module,exports){
class TransactionRecipe{
    constructor(recipe, quantity){
        if(quantity < 0){
            banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER");
            return false;
        }
        if(quantity % 1 !== 0){
            banner.createError("RECIPES WITHIN A TRANSACTION MUST BE WHOLE NUMBERS");
            return false;
        }
        this._recipe = recipe;
        this._quantity = quantity;
    }

    get recipe(){
        return this._recipe;
    }

    get quantity(){
        return this._quantity;
    }
}

class Transaction{
    constructor(id, date, recipes, parent){
        date = new Date(date);
        if(date > new Date()){
            banner.createError("DATE CANNOT BE SET TO THE FUTURE");
            return false;
        }
        this._id = id;
        this._parent = parent;
        this._date = date;
        this._recipes = [];

        for(let i = 0; i < recipes.length; i++){
            for(let j = 0; j < parent.recipes.length; j++){
                if(recipes[i].recipe === parent.recipes[j].id){
                    const transactionRecipe = new TransactionRecipe(
                        parent.recipes[j],
                        recipes[i].quantity
                    )
        
                    this._recipes.push(transactionRecipe);

                    break;
                }
            }
        }
    }

    get id(){
        return this._id;
    }

    get parent(){
        return this._parent;
    }

    get date(){
        return this._date;
    }

    get recipes(){
        return this._recipes;
    }
}

module.exports = Transaction;
},{}],6:[function(require,module,exports){
let analytics = {
    newData: false,
    dateChange: false,
    transactions: [],
    ingredient: {},
    recipe: {},

    display: function(Transaction){
        document.getElementById("analDateBtn").onclick = ()=>{this.changeDates(Transaction)};

        if(this.transactions.length === 0 || this.newData === true){
            let startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            this.transactions = merchant.getTransactions(startDate);
        }

        let slider = document.getElementById("analSlider");
        slider.onchange = ()=>{this.display(Transaction)};

        let ingredientContent = document.getElementById("analIngredientContent");
        let recipeContent = document.getElementById("analRecipeContent");

        if(slider.checked){
            ingredientContent.style.display = "none";
            recipeContent.style.display = "flex";
            this.displayRecipes();
        }else{
            ingredientContent.style.display = "flex";
            recipeContent.style.display = "none"
            this.displayIngredients();
        }
    },

    displayIngredients: function(){
        const itemsList = document.getElementById("itemsList");

        while(itemsList.children.length > 0){
            itemsList.removeChild(itemsList.firstChild);
        }

        for(let i = 0; i < merchant.ingredients.length; i++){
            let li = document.createElement("li");
            li.classList.add("itemButton");
            li.item = merchant.ingredients[i];
            li.innerText = merchant.ingredients[i].ingredient.name;
            li.onclick = ()=>{
                const itemsList = document.getElementById("itemsList");
                for(let i = 0; i < itemsList.children.length; i++){
                    itemsList.children[i].classList.remove("analItemActive");
                }

                li.classList.add("analItemActive");

                this.ingredient = merchant.ingredients[i];
                this.ingredientDisplay();
            };
            itemsList.appendChild(li);
        }

        if(this.dateChange && Object.keys(this.ingredient).length !== 0){
            this.ingredientDisplay();
        }
        this.dateChange = false;
    },

    displayRecipes: function(){
        let recipeList = document.getElementById("analRecipeList");
        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let li = document.createElement("li");
            li.classList.add("itemButton");
            li.recipe = merchant.recipes[i];
            li.innerText = merchant.recipes[i].name;
            li.onclick = ()=>{
                let recipeList = document.getElementById("analRecipeList");
                for(let i = 0; i < recipeList.children.length; i++){
                    recipeList.children[i].classList.remove("analItemActive");
                }
                li.classList.add("analItemActive");

                this.recipe = merchant.recipes[i];
                this.recipeDisplay();
            }

            recipeList.appendChild(li);
        }

        if(this.dateChange  && Object.keys(this.recipe).length !== 0){
            this.recipeDisplay();
        }
        this.dateChange = false;
    },

    ingredientDisplay: function(){
        //Get list of recipes that contain the ingredient
        let containingRecipes = [];

        for(let i = 0; i < merchant.recipes.length; i++){
            for(let j = 0; j < merchant.recipes[i].ingredients.length; j++){
                if(merchant.recipes[i].ingredients[j].ingredient === this.ingredient.ingredient){
                    containingRecipes.push({
                        recipe: merchant.recipes[i],
                        quantity: merchant.recipes[i].ingredients[j].quantity
                    });

                    break;
                }
            }
        }

        //Create Graph
        let quantities = [];
        let dates = [];
        let currentDate = (this.transactions.length > 0) ? this.transactions[0].date : undefined;
        let currentQuantity = 0;

        for(let i = 0; i < this.transactions.length; i++){
            if(currentDate.getDate() !== this.transactions[i].date.getDate()){
                quantities.push(currentQuantity);
                dates.push(currentDate);
                currentQuantity = 0;
                currentDate = this.transactions[i].date;
            }

            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                for(let k = 0; k < containingRecipes.length; k++){
                    if(this.transactions[i].recipes[j].recipe === containingRecipes[k].recipe){
                        for(let l = 0; l < this.transactions[i].recipes[j].recipe.ingredients.length; l++){
                            const transIngredient = this.transactions[i].recipes[j].recipe.ingredients[l];

                            if(transIngredient.ingredient === this.ingredient.ingredient){

                                currentQuantity += transIngredient.quantity * this.transactions[i].recipes[j].quantity;

                                break;
                            }
                        }
                    }
                }
            }

            if(i === this.transactions.length - 1){
                quantities.push(currentQuantity);
                dates.push(currentDate);
            }
        }

        let trace = {
            x: dates,
            y: quantities,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107)"
            }
        }

        const layout = {
            title: this.ingredient.ingredient.name.toUpperCase(),
            xaxis: {
                title: "DATE"
            },
            yaxis: {
                title: `QUANTITY (${this.ingredient.ingredient.unit.toUpperCase()})`,
            }
        }

        Plotly.newPlot("itemUseGraph", [trace], layout);

        //Create use cards
        let sum = 0;
        let max = 0;
        let min = (quantities.length > 0) ? quantities[0] : 0;
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
            if(quantities[i] > max){
                max = quantities[i];
            }else if(quantities[i] < min){
                min = quantities[i];
            }
        }
        document.getElementById("analMinUse").innerText = `${min.toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analAvgUse").innerText = `${(sum / quantities.length).toFixed(2)} ${this.ingredient.ingredient.unit}`;        
        document.getElementById("analMaxUse").innerText = `${max.toFixed(2)} ${this.ingredient.ingredient.unit}`;

        let dayUse = [0, 0, 0, 0, 0, 0, 0];
        let dayCount = [0, 0, 0, 0, 0, 0, 0];
        for(let i = 0; i < quantities.length; i++){
            dayUse[dates[i].getDay()] += quantities[i];
            dayCount[dates[i].getDay()]++;
        }

        document.getElementById("analDayOne").innerText = `${(dayUse[0] / dayCount[0]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDayTwo").innerText = `${(dayUse[1] / dayCount[1]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDayThree").innerText = `${(dayUse[2] / dayCount[2]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDayFour").innerText = `${(dayUse[3] / dayCount[3]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDayFive").innerText = `${(dayUse[4] / dayCount[4]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDaySix").innerText = `${(dayUse[5] / dayCount[5]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDaySeven").innerText = `${(dayUse[6] / dayCount[6]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
    },

    recipeDisplay: function(){
        let quantities = [];
        let dates = [];
        let currentDate = this.transactions[0].date;
        let quantity = 0;

        for(let i = 0; i < this.transactions.length; i++){
            if(currentDate.getDate() !== this.transactions[i].date.getDate()){
                quantities.push(quantity);
                quantity = 0;
                dates.push(currentDate);
                currentDate = this.transactions[i].date;
            }

            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                const recipe = this.transactions[i].recipes[j];

                if(recipe.recipe === this.recipe){
                    quantity += recipe.quantity;
                }
            }

            if(i === this.transactions.length - 1){
                quantities.push(quantity);
                dates.push(currentDate);
            }
        }

        const trace = {
            x: dates,
            y: quantities,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107"
            }
        }

        const layout = {
            title: this.recipe.name.toUpperCase(),
            xaxis: {
                title: "DATE"
            },
            yaxis: {
                title: "Quantity"
            }
        }

        Plotly.newPlot("recipeSalesGraph", [trace], layout);

        let sum = 0;
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
        }

        document.getElementById("recipeAvgUse").innerText = (sum / quantities.length).toFixed(2);
        document.getElementById("recipeAvgRevenue").innerText = `$${(((sum / quantities.length) * this.recipe.price) / 100).toFixed(2)}`;
    },

    changeDates: function(Transaction){
        let dates = {
            from: document.getElementById("analStartDate").valueAsDate,
            to: document.getElementById("analEndDate").valueAsDate
        }

        if(dates.from > dates.to || dates.from === "" || dates.to === "" || dates.to > new Date()){
            banner.createError("INVALID DATE");
            return;
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/transaction/retrieve", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(dates)
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response.data);
                }else{
                    this.transactions = [];

                    for(let i = 0; i < response.length; i++){
                        this.transactions.push(new Transaction(
                            response[i]._id,
                            new Date(response[i].date),
                            response[i].recipes,
                            merchant
                        ));
                    }

                    let isRecipe = document.getElementById("analSlider").checked;
                    if(isRecipe && Object.keys(this.recipe).length !== 0){
                        this.recipeDisplay();
                    }else if(!isRecipe && Object.keys(this.ingredient).length !== 0){
                        this.ingredientDisplay();
                    }
                    
                    this.dateChange = true;
                }
            })
            .catch((err)=>{
                banner.createError("ERROR: UNABLE TO DISPLAY THE DATA");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = analytics;
},{}],7:[function(require,module,exports){
const home = require("./home.js");
const ingredients = require("./ingredients.js");
const recipeBook = require("./recipeBook.js");
const analytics = require("./analytics.js");
const orders = require("./orders.js");
const transactions = require("./transactions.js");

const ingredientDetails = require("./ingredientDetails.js");
const newIngredient = require("./newIngredient.js");
const editIngredient = require("./editIngredient.js");
const newOrder = require("./newOrder.js");
const newRecipe = require("./newRecipe.js");
const editRecipe = require("./editRecipe.js");
const newTransaction = require("./newTransaction.js");
const orderDetails = require("./orderDetails.js");
const recipeDetails = require("./recipeDetails.js");
const transactionDetails = require("./transactionDetails.js");

const Merchant = require("./Merchant.js");
const Ingredient = require("./Ingredient.js");
const Recipe = require("./Recipe.js");
const Order = require("./Order.js");
const Transaction = require("./Transaction.js");

merchant = new Merchant(data.merchant, data.transactions, {
    home: home,
    ingredients: ingredients,
    transactions: transactions,
    recipeBook: recipeBook,
    analytics: analytics,
    orders: orders,
    Ingredient: Ingredient,
    Recipe: Recipe,
    Transaction: Transaction
});

controller = {
    openStrand: function(strand){
        this.closeSidebar();

        let strands = document.querySelectorAll(".strand");
        for(let i = 0; i < strands.length; i++){
            strands[i].style.display = "none";
        }

        let buttons = document.querySelectorAll(".menuButton");
        for(let i = 0; i < buttons.length - 1; i++){
            buttons[i].classList = "menuButton";
            buttons[i].disabled = false;
        }

        let activeButton = {};
        switch(strand){
            case "home": 
                activeButton = document.getElementById("homeBtn");
                document.getElementById("homeStrand").style.display = "flex";
                home.display();
                break;
            case "ingredients": 
                activeButton = document.getElementById("ingredientsBtn");
                document.getElementById("ingredientsStrand").style.display = "flex";
                ingredients.display();
                break;
            case "recipeBook":
                activeButton = document.getElementById("recipeBookBtn");
                document.getElementById("recipeBookStrand").style.display = "flex";
                recipeBook.display(Recipe);
                break;
            case "analytics":
                activeButton = document.getElementById("analyticsBtn");
                document.getElementById("analyticsStrand").style.display = "flex";
                analytics.display(Transaction);
                break;
            case "orders":
                activeButton = document.getElementById("ordersBtn");
                document.getElementById("ordersStrand").style.display = "flex";
                orders.display(Order);
                break;
            case "transactions":
                activeButton = document.getElementById("transactionsBtn");
                document.getElementById("transactionsStrand").style.display = "flex";
                transactions.display(Transaction);
                break;
        }

        activeButton.classList = "menuButton active";
        activeButton.disabled = true;

        if(window.screen.availWidth <= 1000){
            this.closeMenu();
        }
    },

    /*
    Open a specific sidebar
    Input:
    sidebar: the outermost element of the sidebar (must contain class sidebar)
    */
    openSidebar: function(sidebar, data = {}){
        this.closeSidebar();

        document.getElementById("sidebarDiv").classList = "sidebar";
        document.getElementById(sidebar).style.display = "flex";

        switch(sidebar){
            case "ingredientDetails":
                ingredientDetails.display(data, ingredients);
                break;
            case "newIngredient":
                newIngredient.display(Ingredient);
                break;
            case "editIngredient":
                editIngredient.display(data);
                break;
            case "recipeDetails":
                recipeDetails.display(data);
                break;
            case "editRecipe":
                editRecipe.display(data);
                break;
            case "addRecipe":
                newRecipe.display(Recipe);
                break;
            case "orderDetails":
                orderDetails.display(data);
                break;
            case "newOrder":
                newOrder.display(Order);
                break;
            case "transactionDetails":
                transactionDetails.display(data);
                break;
            case "newTransaction":
                newTransaction.display(Transaction);
                break;
        }

        if(window.screen.availWidth <= 1000){
            document.querySelector(".contentBlock").style.display = "none";
            document.getElementById("mobileMenuSelector").style.display = "none";
            document.getElementById("sidebarCloser").style.display = "block";
        }
    },

    closeSidebar: function(){
        let sidebar = document.getElementById("sidebarDiv");
        for(let i = 0; i < sidebar.children.length; i++){
            sidebar.children[i].style.display = "none";
        }
        sidebar.classList = "sidebarHide";

        if(window.screen.availWidth <= 1000){
            document.querySelector(".contentBlock").style.display = "flex";
            document.getElementById("mobileMenuSelector").style.display = "block";
            document.getElementById("sidebarCloser").style.display = "none";
        }
    },

    changeMenu: function(){
        let menu = document.querySelector(".menu");
        let buttons = document.querySelectorAll(".menuButton");
        if(!menu.classList.contains("menuMinimized")){
            menu.classList = "menu menuMinimized";

            for(let i = 0; i < buttons.length; i++){
                buttons[i].children[1].style.display = "none";
            }

            document.getElementById("max").style.display = "none";
            document.getElementById("min").style.display = "flex";

            
        }else if(menu.classList.contains("menuMinimized")){
            menu.classList = "menu";

            for(let i = 0; i < buttons.length; i++){
                buttons[i].children[1].style.display = "block";
            }

            setTimeout(()=>{
                document.getElementById("max").style.display = "flex";
                document.getElementById("min").style.display = "none";
            }, 150);
        }
    },

    openMenu: function(){
        document.getElementById("menu").style.display = "flex";
        document.querySelector(".contentBlock").style.display = "none";
        document.getElementById("mobileMenuSelector").onclick = ()=>{this.closeMenu()};
    },

    closeMenu: function(){
        document.getElementById("menu").style.display = "none";
        document.querySelector(".contentBlock").style.display = "flex";
        document.getElementById("mobileMenuSelector").onclick = ()=>{this.openMenu()};
    },

    /*
    Converts the price of unit back to the price per default unit
    unitType = type of the unit (i.e. mass, volume)
    unit = exact unit to convert to
    price = price of the ingredient per unit in cents
    */
    reconvertPrice(unitType, unit, price){
        if(unitType === "mass"){
            switch(unit){
                case "g": break;
                case "kg": price *= 1000; break;
                case "oz":  price *= 28.3495; break;
                case "lb":  price *= 453.5924; break;
            }
        }else if(unitType === "volume"){
            switch(unit){
                case "ml": price /= 1000; break;
                case "l": break;
                case "tsp": price /= 202.8842; break;
                case "tbsp": price /= 67.6278; break;
                case "ozfl": price /= 33.8141; break;
                case "cup": price /= 4.1667; break;
                case "pt": price /= 2.1134; break;
                case "qt": price /= 1.0567; break;
                case "gal": price *= 3.7854; break;
            }
        }else if(unitType === "length"){
            switch(unit){
                case "mm": price /= 1000; break;
                case "cm": price /= 100; break;
                case "m": break;
                case "in": price /= 39.3701; break;
                case "ft": price /= 3.2808; break;
            }
        }

    return price;
}
}

if(window.screen.availWidth > 1000 && window.screen.availWidth <= 1400){
    this.changeMenu();
    document.getElementById("menuShifter2").style.display = "none";
}

controller.openStrand("home");
},{"./Ingredient.js":1,"./Merchant.js":2,"./Order.js":3,"./Recipe.js":4,"./Transaction.js":5,"./analytics.js":6,"./editIngredient.js":8,"./editRecipe.js":9,"./home.js":10,"./ingredientDetails.js":11,"./ingredients.js":12,"./newIngredient.js":13,"./newOrder.js":14,"./newRecipe.js":15,"./newTransaction.js":16,"./orderDetails.js":17,"./orders.js":18,"./recipeBook.js":19,"./recipeDetails.js":20,"./transactionDetails.js":21,"./transactions.js":22}],8:[function(require,module,exports){
const Ingredient = require("./Ingredient");

let editIngredient = {
    display: function(ingredient){
        let buttonList = document.getElementById("unitButtons");
        let quantLabel = document.getElementById("editIngQuantityLabel");
        let specialLabel = document.getElementById("editSpecialLabel");

        //Clear any existing data
        while(buttonList.children.length > 0){
            buttonList.removeChild(buttonList.firstChild);
        }

        //Populate basic fields
        document.getElementById("editIngTitle").innerText = ingredient.ingredient.name;
        document.getElementById("editIngName").value = ingredient.ingredient.name;
        document.getElementById("editIngCategory").value = ingredient.ingredient.category;
        quantLabel.innerText = `CURRENT STOCK (${ingredient.ingredient.unit.toUpperCase()})`;
        document.getElementById("editIngSubmit").onclick = ()=>{this.submit(ingredient)};

        //Populate the unit buttons
        const units = merchant.units[ingredient.ingredient.unitType];

        for(let i = 0; i < units.length; i++){
            let button = document.createElement("button");
            button.classList.add("unitButton");
            button.innerText = units[i].toUpperCase();
            button.onclick = ()=>{this.changeUnit(button)};
            buttonList.appendChild(button);

            if(units[i] === ingredient.ingredient.unit){
                button.classList.add("unitActive");
            }
        }
        
        //Make any changes for special ingredients
        if(ingredient.ingredient.specialUnit === "bottle"){
            quantLabel.innerText = "CURRENT STOCK (BOTTLES):";

            specialLabel.style.display = "flex";
            specialLabel.innerText = `BOTTLE SIZE (${ingredient.ingredient.unit.toUpperCase()}):`;
            
            let sizeInput = document.createElement("input");
            sizeInput.id = "editIngSpecialSize";
            sizeInput.type = "number";
            sizeInput.min = "0";
            sizeInput.step = "0.01";
            sizeInput.value = ingredient.ingredient.unitSize.toFixed(2);
            specialLabel.appendChild(sizeInput);
        }else{
            specialLabel.style.display = "none";
        }

        let quantInput = document.createElement("input");
        quantInput.id = "editIngQuantity";
        quantInput.type = "number";
        quantInput.min = "0";
        quantInput.step = "0.01";
        quantInput.value = ingredient.quantity.toFixed(2);
        quantLabel.appendChild(quantInput);
    },

    changeUnit(button){
        let buttons = document.getElementById("unitButtons");

        for(let i = 0; i < buttons.children.length; i++){
            buttons.children[i].classList.remove("unitActive");
        }

        button.classList.add("unitActive");
    },

    submit(ingredient){
        const quantity = parseFloat(document.getElementById("editIngQuantityLabel").children[0].value);

        let data = {
            id: ingredient.ingredient.id,
            name: document.getElementById("editIngName").value,
            category: document.getElementById("editIngCategory").value
        }

        //Add data based on unit type
        if(ingredient.ingredient.specialUnit === "bottle"){
            let unitSize = ingredient.convertToBase(parseFloat(document.getElementById("editSpecialLabel").children[0].value));
            data.quantity = quantity * unitSize;
            data.unitSize = unitSize;
        }else{
            data.quantity = ingredient.convertToBase(quantity);
        }

        //Get the measurement unit
        let units = document.getElementById("unitButtons");
        for(let i = 0; i < units.children.length; i++){
            if(units.children[i].classList.contains("unitActive")){
                data.unit = units.children[i].innerText.toLowerCase();
                break;
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/ingredients/update", {
            method: "put",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then((response)=>{
            if(typeof(response) === "string"){
                banner.createError(response);
            }else{
                ingredient.ingredient.name = response.ingredient.name;
                ingredient.ingredient.category = response.ingredient.category;
                ingredient.ingredient.unitSize = response.ingredient.unitSize;
                ingredient.ingredient.unit = response.unit;

                merchant.updateIngredient(ingredient, response.quantity);
                controller.openStrand("ingredients");
                banner.createNotification("INGREDIENT UPDATED");
            }
        })
        .catch((err)=>{
            banner.createError("SOMETHING WENT WRONG, PLEASE REFRESH THE PAGE");
        })
        .finally(()=>{
            loader.style.display = "none";
        });
    }
}

module.exports = editIngredient;
},{"./Ingredient":1}],9:[function(require,module,exports){
let editRecipe = {
    display: function(recipe){
        let nameInput = document.getElementById("editRecipeName");
        if(merchant.pos === "none"){
            nameInput.value = recipe.name;
        }else{
            document.getElementById("editRecipeNoName").innertext = recipe.name;
            nameInput.parentNode.style.display = "none";
        }

        //Populate ingredients
        let ingredientList = document.getElementById("editRecipeIngList");

        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.getElementById("editRecipeIng").content.children[0];
        for(let i = 0; i < recipe.ingredients.length; i++){
            let ingredientDiv = template.cloneNode(true);
            ingredientDiv.children[0].onclick = ()=>{ingredientDiv.parentNode.removeChild(ingredientDiv)};
            ingredientDiv.children[1].innerText = recipe.ingredients[i].ingredient.getNameAndUnit();
            ingredientDiv.children[2].style.display = "none";
            ingredientDiv.children[3].value = recipe.ingredients[i].quantity;
            ingredientDiv.ingredient = recipe.ingredients[i];
            
            ingredientList.appendChild(ingredientDiv);
        }

        document.getElementById("addRecIng").onclick = ()=>{this.newIngredient()};
        document.getElementById("editRecipePrice").value = recipe.price;
        document.getElementById("editRecipeSubmit").onclick = ()=>{this.submit(recipe)};
        document.getElementById("editRecipeCancel").onclick = ()=>{controller.openSidebar("recipeDetails", recipe)};
    },

    newIngredient: function(){
        let ingredientList = document.getElementById("editRecipeIngList");

        let ingredientDiv = document.getElementById("editRecipeIng").content.children[0].cloneNode(true);
        ingredientDiv.children[0].onclick = ()=>{ingredientDiv.parentNode.removeChild(ingredientDiv)};
        ingredientDiv.children[1].style.display = "none";
        ingredientDiv.children[3].value = "0.00";

        //Populate selector
        let categories = merchant.categorizeIngredients();
        for(let i = 0; i < categories.length; i++){
            let group = document.createElement("optgroup");
            group.label = categories[i].name;

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let option = document.createElement("option");
                option.innerText = categories[i].ingredients[j].ingredient.getNameAndUnit();
                option.ingredient = categories[i].ingredients[j];
                group.appendChild(option);
            }
            
            ingredientDiv.children[2].appendChild(group);
        }

        ingredientList.appendChild(ingredientDiv);
    },

    submit: function(recipe){
        let data = {
            id: recipe.id,
            name: recipe.name,
            price: document.getElementById("editRecipePrice").value * 100,
            ingredients: []
        }

        if(merchant.pos === "none"){
            data.name = document.getElementById("editRecipeName").value;
        }

        let ingredients = document.getElementById("editRecipeIngList").children;
        for(let i = 0; i < ingredients.length; i++){
            const quantity = parseFloat(ingredients[i].children[3].value);

            if(ingredients[i].children[1].style.display === "none"){
                let selector = ingredients[i].children[2];
                let ingredient = selector.options[selector.selectedIndex].ingredient;

                data.ingredients.push({
                    ingredient: ingredient.ingredient.id,
                    quantity: ingredient.convertToBase(quantity)
                });
            }else{
                data.ingredients.push({
                    ingredient: ingredients[i].ingredient.ingredient.id,
                    quantity: ingredients[i].ingredient.convertToBase(quantity)
                });
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/recipe/update", {
            method: "put",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.updateRecipe(response);
                    controller.openStrand("recipeBook");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG, PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = editRecipe;
},{}],10:[function(require,module,exports){
let home = {
    isPopulated: false,

    display: function(){
        if(!this.isPopulated){
            this.drawRevenueCard();
            this.drawRevenueGraph();
            this.drawInventoryCheckCard();
            this.drawPopularCard();

            this.isPopulated = true;
        }
    },

    drawRevenueCard: function(){
        let today = new Date();
        let firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        let firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        let lastMonthToDay = new Date(new Date().setMonth(today.getMonth() - 1));

        const revenueThisMonth = merchant.getRevenue(firstOfMonth);
        const revenueLastMonthToDay = merchant.getRevenue(firstOfLastMonth, lastMonthToDay);

        document.getElementById("revenue").innerText = `$${revenueThisMonth.toFixed(2)}`;

        let revenueChange = ((revenueThisMonth - revenueLastMonthToDay) / revenueLastMonthToDay) * 100;
        
        let img = "";
        if(revenueChange >= 0){
            img = "/shared/images/upArrow.png";
        }else{
            img = "/shared/images/downArrow.png";
        }
        document.querySelector("#revenueChange p").innerText = `${Math.abs(revenueChange).toFixed(2)}% vs last month`;
        document.querySelector("#revenueChange img").src = img;
    },

    drawRevenueGraph: function(){
        let monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        let revenue = [];
        let dates = [];
        let dayRevenue = 0;
        const transactions = merchant.getTransactions(monthAgo);
        let currentDate = (transactions.length > 0) ? transactions[0].date : undefined;
        for(let i = 0; i < transactions.length; i++){
            if(transactions[i].date.getDate() !== currentDate.getDate()){
                revenue.push(dayRevenue / 100);
                dayRevenue = 0;
                dates.push(currentDate);
                currentDate = transactions[i].date;
            }

            for(let j = 0; j < transactions[i].recipes.length; j++){
                const recipe = transactions[i].recipes[j];

                dayRevenue += recipe.recipe.price * recipe.quantity;
            }
        }

        const trace = {
            x: dates,
            y: revenue,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107)"
            }
        }

        const layout = {
            title: "REVENUE",
            xaxis: {
                title: "DATE"
            },
            yaxis: {
                title: "$"
            }
        }

        Plotly.newPlot("graphCard", [trace], layout);
    },

    drawInventoryCheckCard: function(){
        let num;
        if(merchant.ingredients.length < 5){
            num = merchant.ingredients.length;
        }else{
            num = 5;
        }
        let rands = [];
        for(let i = 0; i < num; i++){
            let rand = Math.floor(Math.random() * merchant.ingredients.length);

            if(rands.includes(rand)){
                i--;
            }else{
                rands[i] = rand;
            }
        }

        let ul = document.querySelector("#inventoryCheckCard ul");
        let template = document.getElementById("ingredientCheck").content.children[0];
        while(ul.children.length > 0){
            ul.removeChild(ul.firstChild);
        }
        for(let i = 0; i < rands.length; i++){
            let ingredientCheck = template.cloneNode(true);
            let input = ingredientCheck.children[1].children[1];
            const ingredient = merchant.ingredients[rands[i]];

            ingredientCheck.ingredient = ingredient;
            ingredientCheck.children[0].innerText = ingredient.ingredient.name;
            ingredientCheck.children[1].children[0].onclick = ()=>{
                input.value--;
                input.changed = true;
            };
            if(ingredient.ingredient.specialUnit === "bottle"){
                input.value = ingredient.quantity.toFixed(2);
                ingredientCheck.children[2].innerText = "BOTTLES";
            }else{
                input.value = ingredient.quantity.toFixed(2);
                ingredientCheck.children[2].innerText = ingredient.ingredient.unit.toUpperCase();
            }

            
            ingredientCheck.children[1].children[2].onclick = ()=>{
                input.value++;
                input.changed = true;
            }
            input.onchange = ()=>{input.changed = true};
            

            ul.appendChild(ingredientCheck);
        }

        document.getElementById("inventoryCheck").onclick = ()=>{this.submitInventoryCheck()};
    },

    drawPopularCard: function(){
        let thisMonth = new Date();
        thisMonth.setDate(1);

        const ingredientList = merchant.getIngredientsSold(thisMonth);
        if(ingredientList !== false){
            ingredientList.sort((a, b)=>{
                if(a.quantity < b.quantity){
                    return 1;
                }
                if(a.quantity > b.quantity){
                    return -1;
                }

                return 0;
            });

            let quantities = [];
            let labels = [];
            let colors = [];
            let count = (ingredientList.length < 5) ? ingredientList.length - 1 : 4;
            for(let i = count; i >= 0; i--){
                const ingredientName = ingredientList[i].ingredient.name;
                const ingredientQuantity = ingredientList[i].quantity;
                const unitName = ingredientList[i].ingredient.unit;

                quantities.push(ingredientList[i].quantity);
                labels.push(`${ingredientName}: ${ingredientQuantity.toFixed(2)} ${unitName.toUpperCase()}`);
                if(i === 0){
                    colors.push("rgb(255, 99, 107");
                }else{
                    colors.push("rgb(179, 191, 209");
                }
            }

            let trace = {
                x: quantities,
                type: "bar",
                orientation: "h",
                text: labels,
                textposition: "auto",
                hoverinfo: "none",
                marker: {
                    color: colors
                }
            }

            let layout = {
                title: "MOST POPULAR INGREDIENTS",
                xaxis: {
                    zeroline: false,
                    title: "QUANTITY"
                },
                yaxis: {
                    showticklabels: false
                }
            }
            
            Plotly.newPlot("popularIngredientsCard", [trace], layout);
        }else{
            document.getElementById("popularCanvas").style.display = "none";

            let notice = document.createElement("p");
            notice.innerText = "N/A";
            notice.classList = "notice";
            document.getElementById("popularIngredientsCard").appendChild(notice);
        }
    },

    //Need to change the updating of ingredients
    //should update the ingredient directly, then send that.  Maybe...
    submitInventoryCheck: function(){
        let lis = document.querySelectorAll("#inventoryCheckCard li");

        let changes = [];
        let fetchData = [];

        for(let i = 0; i < lis.length; i++){
            if(lis[i].children[1].children[1].value >= 0){
                let merchIngredient = lis[i].ingredient;

                if(lis[i].children[1].children[1].changed === true){
                    let value = 0;
                    if(merchIngredient.ingredient.specialUnit === "bottle"){
                        value = parseFloat(lis[i].children[1].children[1].value) * merchIngredient.ingredient.unitSize;
                    }else{
                        value = controller.convertToMain(merchIngredient.ingredient.unit, parseFloat(lis[i].children[1].children[1].value));
                    }
                    

                    changes.push({
                        ingredient: merchIngredient.ingredient,
                        quantity: value
                    });

                    fetchData.push({
                        id: merchIngredient.ingredient.id,
                        quantity: value
                    });

                    lis[i].children[1].children[1].changed = false;
                }
            }else{
                banner.createError("CANNOT HAVE NEGATIVE INGREDIENTS");
                return;
            }
        }
        
        if(fetchData.length > 0){
            let loader = document.getElementById("loaderContainer");
            loader.style.display = "flex";

            fetch("/merchant/ingredients/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(fetchData)
            })
                .then(response => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        for(let i = 0; i < changes.length; i++){
                            merchant.updateIngredient(changes[i].ingredient, changes[i].quantity);
                        }
                        banner.createNotification("INGREDIENTS UPDATED");
                    }
                })
                .catch((err)=>{})
                .finally(()=>{
                    loader.style.display = "none";
                });
        }
    }
}

module.exports = home;
},{}],11:[function(require,module,exports){
let ingredientDetails = {
    ingredient: {},
    dailyUse: 0,

    display: function(ingredient){
        document.getElementById("editIngBtn").onclick = ()=>{controller.openSidebar("editIngredient", ingredient)};
        document.getElementById("ingredientDetailsCategory").innerText = ingredient.ingredient.category;
        document.getElementById("ingredientDetailsName").innerText = ingredient.ingredient.name;
        document.getElementById("ingredientStock").innerText = ingredient.getQuantityDisplay();


        //Calculate and display average daily use
        let quantities = [];
        let now = new Date();
        for(let i = 1; i < 31; i++){
            let endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
            let startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i - 1);

            quantities.push(merchant.getSingleIngredientSold(ingredient, startDay, endDay));
        }

        let sum = 0;
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
        }

        let dailyUse = sum / quantities.length;
        const dailyUseDiv = document.getElementById("dailyUse");
        if(ingredient.ingredient.specialUnit === "bottle"){
            dailyUseDiv.innerText = `${dailyUse.toFixed(2)} BOTTLES`;
        }else{
            dailyUseDiv.innerText = `${dailyUse.toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;
        }

        //Show recipes that this ingredient is a part of
        let ul = document.getElementById("ingredientRecipeList");
        let recipes = merchant.getRecipesForIngredient(ingredient.ingredient);
        while(ul.children.length > 0){
            ul.removeChild(ul.firstChild);
        }
        for(let i = 0; i < recipes.length; i++){
            let li = document.createElement("li");
            li.innerText = recipes[i].name;
            li.onclick = ()=>{
                controller.openStrand("recipeBook");
                controller.openSidebar("recipeDetails", recipes[i]);
            }
            ul.appendChild(li);
        }
    },

    remove: function(ingredientsStrand){
        for(let i = 0; i < merchant.recipes.length; i++){
            for(let j = 0; j < merchant.recipes[i].ingredients.length; j++){
                if(this.ingredient.ingredient === merchant.recipes[i].ingredients[j].ingredient){
                    banner.createError("MUST REMOVE INGREDIENT FROM ALL RECIPES BEFORE REMOVING FROM INVENTORY");
                    return;
                }
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/ingredients/remove/${this.ingredient.ingredient.id}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.removeIngredient(this.ingredient);
                    ingredientsStrand.display();
                    banner.createNotification("INGREDIENT REMOVED");
                }
            })
            .catch((err)=>{})
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = ingredientDetails;
},{}],12:[function(require,module,exports){
const { populate } = require("./orders");

let ingredients = {
    isPopulated: false,
    ingredients: [],

    display: function(){
        if(!this.isPopulated){
            document.getElementById("ingredientSearch").oninput = ()=>{this.search()};
            document.getElementById("ingredientClearButton").onclick = ()=>{this.clearSorting()};
            document.getElementById("ingredientSelect").onchange = ()=>{this.sort()};

            this.populateByProperty("category");

            this.isPopulated = true;
        }
    },

    populateByProperty: function(property){
        let categories;
        if(property === "category"){
            categories = merchant.categorizeIngredients();
        }else if(property === "unit"){
            categories = merchant.unitizeIngredients();
        }
        
        let ingredientStrand = document.getElementById("categoryList");
        let categoryTemplate = document.getElementById("categoryDiv").content.children[0];
        let ingredientTemplate = document.getElementById("ingredient").content.children[0];
        this.ingredients = [];

        while(ingredientStrand.children.length > 0){
            ingredientStrand.removeChild(ingredientStrand.firstChild);
        }

        for(let i = 0; i < categories.length; i++){
            let categoryDiv = categoryTemplate.cloneNode(true);
            categoryDiv.children[0].children[0].innerText = categories[i].name.toUpperCase();
            
            categoryDiv.children[0].children[1].onclick = ()=>{
                this.toggleCategory(categoryDiv.children[1], categoryDiv.children[0].children[1]);
            };
            categoryDiv.children[1].style.display = "none";
            ingredientStrand.appendChild(categoryDiv);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let ingredient = categories[i].ingredients[j];
                let ingredientDiv = ingredientTemplate.cloneNode(true);

                ingredientDiv.children[0].innerText = ingredient.ingredient.name;
                ingredientDiv.onclick = ()=>{controller.openSidebar("ingredientDetails", ingredient)};
                ingredientDiv._name = ingredient.ingredient.name.toLowerCase();
                ingredientDiv._unit = ingredient.ingredient.unit.toLowerCase();

                
                if(ingredient.ingredient.specialUnit === "bottle"){
                    ingredientDiv.children[2].innerText = `${ingredient.quantity.toFixed(2)} BOTTLES`
                }else{
                    ingredientDiv.children[2].innerText = `${ingredient.quantity.toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;
                }

                categoryDiv.children[1].appendChild(ingredientDiv);
                this.ingredients.push(ingredientDiv);
            }
        }

    },

    displayIngredientsOnly: function(ingredients){
        let ingredientDiv = document.getElementById("categoryList");

        while(ingredientDiv.children.length > 0){
            ingredientDiv.removeChild(ingredientDiv.firstChild);
        }
        for(let i = 0; i < ingredients.length; i++){
            ingredientDiv.appendChild(ingredients[i]);
        }
    },

    toggleCategory: function(div, button){
        if(div.style.display === "none"){
            button.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
            div.style.display = "flex";
        }else if(div.style.display === "flex"){
            button.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
            div.style.display = "none";
        }
    },

    search: function(){
        let input = document.getElementById("ingredientSearch").value.toLowerCase();
        document.getElementById("ingredientSelect").selectedIndex = 0;

        if(input === ""){
            this.populateByProperty("category");
            document.getElementById("ingredientClearButton").style.display = "none";
            return;
        }

        let matchingIngredients = [];
        for(let i = 0; i < this.ingredients.length; i++){
            if(this.ingredients[i]._name.includes(input)){
                matchingIngredients.push(this.ingredients[i]);
            }
        }

        document.getElementById("ingredientClearButton").style.display = "inline";
        this.displayIngredientsOnly(matchingIngredients);
    },

    sort: function(){
        let sortType = document.getElementById("ingredientSelect").value;
        
        if(sortType === ""){
            return;
        }

        document.getElementById("ingredientSearch").value = "";

        if(sortType === "category"){
            this.populateByProperty("category");
            return;
        }

        if(sortType === "unit"){
            this.populateByProperty("unit");
            return;
        }

        document.getElementById("ingredientClearButton").style.display = "inline";
        let sortedIngredients = this.ingredients.slice().sort((a, b)=> (a[sortType] > b[sortType]) ? 1 : -1);
        this.displayIngredientsOnly(sortedIngredients);
    },

    clearSorting: function(button){
        document.getElementById("ingredientSearch").value = "";
        document.getElementById("ingredientSelect").selectedIndex = 0;
        document.getElementById("ingredientClearButton").style.display = "none";

        this.populateByProperty("category");
    }
}

module.exports = ingredients;
},{"./orders":18}],13:[function(require,module,exports){
const ingredients = require("./ingredients");

let newIngredient = {
    display: function(Ingredient){
        const selector = document.getElementById("unitSelector");

        document.getElementById("newIngName").value = "";
        document.getElementById("newIngCategory").value = "";
        document.getElementById("newIngQuantity").value = 0;
        document.getElementById("bottleSizeLabel").style.display = "none";
        selector.value = "g";

        selector.onchange = ()=>{this.unitChange()};
        document.getElementById("submitNewIng").onclick = ()=>{this.submit(Ingredient)};
    },

    unitChange: function(){
        const select = document.getElementById("unitSelector");
        const bottleLabel = document.getElementById("bottleSizeLabel");
        if(select.value === "bottle"){
            bottleLabel.style.display = "block";
        }else{
            bottleLabel.style.display = "none";
        }
    },

    submit: function(Ingredient){
        let unitSelector = document.getElementById("unitSelector");
        let options = document.querySelectorAll("#unitSelector option");
        const quantityValue = parseFloat(document.getElementById("newIngQuantity").value);

        let unit = unitSelector.value;

        let newIngredient = {
            ingredient: {
                name: document.getElementById("newIngName").value,
                category: document.getElementById("newIngCategory").value,
                unitType: options[unitSelector.selectedIndex].getAttribute("type")
            },
            quantity: quantityValue,
            defaultUnit: unit
        }

        //Change the ingredient if it is a special unit type (ie "bottle")
        if(unit === "bottle"){
            newIngredient.ingredient.unitType = "volume";
            newIngredient.ingredient.unitSize = document.getElementById("bottleSize").value
            newIngredient.defaultUnit = document.getElementById("bottleUnits").value;
            newIngredient.ingredient.specialUnit = unit;
            newIngredient.quantity = quantityValue;
        }
    
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/ingredients/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(newIngredient)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    const ingredient = new Ingredient(
                        response.ingredient._id,
                        response.ingredient.name,
                        response.ingredient.category,
                        response.ingredient.unitType,
                        response.defaultUnit,
                        merchant,
                        response.ingredient.specialUnit,
                        response.ingredient.unitSize
                    )

                    merchant.addIngredient(ingredient, response.quantity);
                    ingredients.display();
                    controller.closeSidebar();

                    banner.createNotification("INGREDIENT CREATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = newIngredient;
},{"./ingredients":12}],14:[function(require,module,exports){
let newOrder = {
    display: function(Order){
        document.getElementById("sidebarDiv").classList.add("sidebarWide");
        document.getElementById("newOrderIngredientList").style.display = "flex";

        let selectedList = document.getElementById("selectedIngredientList");
        while(selectedList.children.length > 0){
            selectedList.removeChild(selectedList.firstChild);
        }

        let ingredientList = document.getElementById("newOrderIngredients");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        for(let i = 0; i < merchant.ingredients.length; i++){
            let ingredient = document.createElement("button");
            ingredient.classList = "newOrderIngredient";
            ingredient.innerText = merchant.ingredients[i].ingredient.name;
            ingredient.onclick = ()=>{this.addIngredient(merchant.ingredients[i], ingredient)};
            ingredientList.appendChild(ingredient);
        }

        document.getElementById("submitNewOrder").onclick = ()=>{this.submit(Order)};
    },

    addIngredient: function(ingredient, element){
        element.style.display = "none";

        let div = document.getElementById("selectedIngredient").content.children[0].cloneNode(true);
        div.ingredient = ingredient;
        div.children[0].children[1].onclick = ()=>{this.removeIngredient(div, element)};

        //Display units depending on the whether it is a special unit
        if(ingredient.ingredient.specialUnit === "bottle"){
            div.children[0].children[0].innerText = `${ingredient.ingredient.name} (BOTTLES)`;
        }else{
            div.children[0].children[0].innerText = `${ingredient.ingredient.name} (${ingredient.ingredient.unit.toUpperCase()})`;
        }

        document.getElementById("selectedIngredientList").appendChild(div);
    },

    removeIngredient: function(selectedElement, element){
        selectedElement.parentElement.removeChild(selectedElement);
        element.style.display = "block";
    },

    submit: function(Order){
        let date = document.getElementById("newOrderDate").value;
        let taxes = document.getElementById("orderTaxes").value * 100;
        let fees = document.getElementById("orderFees").value * 100;
        let ingredients = document.getElementById("selectedIngredientList").children;

        if(date === ""){
            banner.createError("DATE IS REQUIRED FOR ORDERS");
            return;
        }

        let data = {
            name: document.getElementById("newOrderName").value,
            date: date,
            taxes: taxes,
            fees: fees,
            ingredients: []
        }

        for(let i = 0; i < ingredients.length; i++){
            let quantity = ingredients[i].children[1].children[0].value;
            let price = ingredients[i].children[1].children[1].value;

            if(quantity === "" || price === ""){
                banner.createError("MUST PROVIDE QUANTITY AND PRICE PER UNIT FOR ALL INGREDIENTS");
                return;
            }

            if(quantity < 0 || price < 0){
                banner.createError("QUANTITY AND PRICE MUST BE NON-NEGATIVE NUMBERS");
            }

            if(ingredients[i].ingredient.ingredient.specialUnit === "bottle"){
                data.ingredients.push({
                    ingredient: ingredients[i].ingredient.ingredient.id,
                    quantity: quantity * ingredients[i].ingredient.ingredient.unitSize,
                    pricePerUnit: this.convertPrice(ingredients[i].ingredient.ingredient, price * 100)
                });
            }else{
                data.ingredients.push({
                    ingredient: ingredients[i].ingredient.ingredient.id,
                    quantity: ingredients[i].ingredient.convertToBase(quantity),
                    pricePerUnit: this.convertPrice(ingredients[i].ingredient.ingredient, price * 100)
                });
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/order/create", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then((response)=>response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    let ingredients = [];
                    for(let i = 0; i < response.ingredients.length; i++){
                        for(let j = 0; j < merchant.ingredients.length; j++){
                            if(merchant.ingredients[j].ingredient.id === response.ingredients[i].ingredient){
                                ingredients.push({
                                    ingredient: merchant.ingredients[j].ingredient,
                                    quantity: response.ingredients[i].quantity,
                                    pricePerUnit: response.ingredients[j].pricePerUnit
                                });

                                break;
                            }
                        }
                    }

                    let order = new Order(
                        response._id,
                        response.name,
                        response.date,
                        response.taxes,
                        response.fees,
                        ingredients,
                        merchant
                    );

                    merchant.addOrder(order, true);
                    
                    controller.openStrand("orders");
                    banner.createNotification("NEW ORDER CREATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG, PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    convertPrice: function(ingredient, price){
        if(ingredient.specialUnit === "bottle"){
            return price / ingredient.unitSize;
        }

        switch(ingredient.unit){
            case "g": return price;
            case "kg": return price / 1000; 
            case "oz": return price / 28.3495; 
            case "lb": return price / 453.5924; 
            case "ml": return price * 1000; 
            case "l": return price;
            case "tsp": return price * 202.8842; 
            case "tbsp": return price * 67.6278; 
            case "ozfl": return price * 33.8141; 
            case "cup": return price * 4.1667; 
            case "pt": return price * 2.1134; 
            case "qt": return price * 1.0567; 
            case "gal": return price / 3.7854; 
            case "mm": return price * 1000; 
            case "cm": return price * 100; 
            case "m": return price;
            case "in": return price * 39.3701; 
            case "ft": return price * 3.2808; 
        }
    }
}

module.exports = newOrder;
},{}],15:[function(require,module,exports){
let newRecipe = {
    display: function(Recipe){
        let ingredientsSelect = document.querySelector("#recipeInputIngredients select");
        let categories = merchant.categorizeIngredients();

        while(ingredientsSelect.children.length > 0){
            ingredientsSelect.removeChild(ingredientsSelect.firstChild);
        }

        for(let i = 0; i < categories.length; i++){
            let optgroup = document.createElement("optgroup");
            optgroup.label = categories[i].name;
            ingredientsSelect.appendChild(optgroup);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let option = document.createElement("option");
                option.value = categories[i].ingredients[j].ingredient.id;
                option.innerText = `${categories[i].ingredients[j].ingredient.name} (${categories[i].ingredients[j].ingredient.unit})`;
                optgroup.appendChild(option);
            }
        }

        document.getElementById("ingredientCount").onchange = ()=>{this.changeRecipeCount()};
        document.getElementById("submitNewRecipe").onclick = ()=>{this.submit(Recipe)};
    },

    //Updates the number of ingredient inputs displayed for new recipes
    changeRecipeCount: function(){
        let newCount = document.getElementById("ingredientCount").value;
        let ingredientsDiv = document.getElementById("recipeInputIngredients");
        let oldCount = ingredientsDiv.children.length;

        if(newCount > oldCount){
            let newDivs = newCount - oldCount;

            for(let i = 0; i < newDivs; i++){
                let newNode = ingredientsDiv.children[0].cloneNode(true);
                newNode.children[2].children[0].value = "";

                ingredientsDiv.appendChild(newNode);
            }

            for(let i = 0; i < newCount; i++){
                ingredientsDiv.children[i].children[0].innerText = `INGREDIENT ${i + 1}`;
            }
        }else if(newCount < oldCount){
            let newDivs = oldCount - newCount;

            for(let i = 0; i < newDivs; i++){
                ingredientsDiv.removeChild(ingredientsDiv.children[ingredientsDiv.children.length-1]);
            }
        }
    },

    submit: function(Recipe){
        let newRecipe = {
            name: document.getElementById("newRecipeName").value,
            price: document.getElementById("newRecipePrice").value,
            ingredients: []
        }

        let inputs = document.querySelectorAll("#recipeInputIngredients > div");
        for(let i = 0; i < inputs.length; i++){
            for(let j = 0; j < merchant.ingredients.length; j++){
                if(merchant.ingredients[j].ingredient.id === inputs[i].children[1].children[0].value){
                    newRecipe.ingredients.push({
                        ingredient: inputs[i].children[1].children[0].value,
                        quantity: merchant.ingredients[j].convertToBase(inputs[i].children[2].children[0].value)
                    });

                    break;
                }
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/recipe/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(newRecipe)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    let ingredients = [];
                    for(let i = 0; i < response.ingredients.length; i++){
                        for(let j = 0; j < merchant.ingredients.length; j++){
                            if(merchant.ingredients[j].ingredient.id === response.ingredients[i].ingredient){
                                ingredients.push({
                                    ingredient: merchant.ingredients[j].ingredient,
                                    quantity: response.ingredients[i].quantity
                                });

                                break;
                            }
                        }
                    }

                    merchant.addRecipe(new Recipe(
                        response._id,
                        response.name,
                        response.price,
                        ingredients,
                        merchant
                    ));

                    banner.createNotification("RECIPE CREATED");
                    controller.openStrand("recipeBook");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },
}

module.exports = newRecipe;
},{}],16:[function(require,module,exports){
let newTransaction = {
    display: function(Transaction){
        let recipeList = document.getElementById("newTransactionRecipes");
        let template = document.getElementById("createTransaction").content.children[0];

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let recipeDiv = template.cloneNode(true);
            recipeDiv.recipe = merchant.recipes[i];
            recipeList.appendChild(recipeDiv);

            recipeDiv.children[0].innerText = merchant.recipes[i].name;
        }

        document.getElementById("submitNewTransaction").onclick = ()=>{this.submit(Transaction)};
    },

    submit: function(Transaction){
        let recipeDivs = document.getElementById("newTransactionRecipes");
        let date = document.getElementById("newTransactionDate").valueAsDate;
        
        if(date > new Date()){
            banner.createError("CANNOT HAVE A DATE IN THE FUTURE");
            return;
        }
        
        let data = {
            date: date,
            recipes: [],
            ingredientUpdates: {}
        };

        for(let i = 0; i < recipeDivs.children.length;  i++){
            let quantity = recipeDivs.children[i].children[1].value;
            const recipe = recipeDivs.children[i].recipe;
            if(quantity !== "" && quantity > 0){
                data.recipes.push({
                    recipe: recipe.id,
                    quantity: quantity
                });
            }else if(quantity < 0){
                banner.createError("CANNOT HAVE NEGATIVE VALUES");
                return;
            }
        }

        if(data.recipes.length > 0){
            let loader = document.getElementById("loaderContainer");
            loader.style.display = "flex";

            fetch("/transaction/create", {
                method: "post",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        const transaction = new Transaction(
                            response._id,
                            response.date,
                            response.recipes,
                            merchant
                        );

                        merchant.addTransaction(transaction);
                        banner.createNotification("NEW TRANSACTION CREATED, INGREDIENTS UPDATED ACCORDINGLY");
                    }
                })
                .catch((err)=>{
                    banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
                })
                .finally(()=>{
                    loader.style.display = "none";
                });
        }
    }
}

module.exports = newTransaction;
},{}],17:[function(require,module,exports){
let orderDetails = {
    display: function(order){
        document.getElementById("removeOrderBtn").onclick = ()=>{this.remove(order)};

        document.getElementById("orderDetailName").innerText = order.name;
        document.getElementById("orderDetailDate").innerText = order.date.toLocaleDateString("en-US");
        document.getElementById("orderDetailTax").innerText = `$${(order.taxes / 100).toFixed(2)}`;
        document.getElementById("orderDetailFee").innerText = `$${(order.fees / 100).toFixed(2)}`;

        let ingredientList = document.getElementById("orderIngredients");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.getElementById("orderIngredient").content.children[0];
        for(let i = 0; i < order.ingredients.length; i++){
            let ingredientDiv = template.cloneNode(true);
            const ingredient = order.ingredients[i].ingredient;
            
            ingredientDiv.children[0].innerText = order.ingredients[i].ingredient.name;
            ingredientDiv.children[2].innerText = `$${(order.ingredients[i].cost() / 100).toFixed(2)}`;
            
            const ingredientDisplay = ingredientDiv.children[1];
            if(ingredient.specialUnit === "bottle"){
                ingredientDisplay.innerText = `${order.ingredients[i].quantity.toFixed(2)} bottles x $${(order.ingredients.pricePerUnit / 100).toFixed(2)}`;
            }else{
                ingredientDisplay.innerText = `${order.ingredients[i].quantity.toFixed(2)} ${ingredient.unit.toUpperCase()} X $${(order.ingredients[i].pricePerUnit / 100).toFixed(2)}`;
            }

            ingredientList.appendChild(ingredientDiv);
        }

        document.getElementById("orderDetailTotal").innerText = `$${(order.getIngredientCost() / 100).toFixed(2)}`;
        document.querySelector("#orderTotalPrice p").innerText = `$${(order.getTotalCost() / 100).toFixed(2)}`;
    },

    remove: function(order){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/order/${order.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.removeOrder(order);

                    controller.openStrand("orders");
                    banner.createNotification("ORDER REMOVED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = orderDetails;
},{}],18:[function(require,module,exports){
let orders = {
    isPopulated: false,
    isFetched: false,

    display: async function(Order){
        if(!this.isFetched){
            let loader = document.getElementById("loaderContainer");
            loader.style.display = "flex";

            fetch("/order", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
            })
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        for(let i = 0; i < response.length; i++){
                            let ingredients = [];
                            for(let j = 0; j < response[i].ingredients.length; j++){
                                const orderIngredient = response[i].ingredients[j];
                                for(let k = 0; k < merchant.ingredients.length; k++){
                                    if(merchant.ingredients[k].ingredient.id === orderIngredient.ingredient){
                                        ingredients.push({
                                            ingredient: merchant.ingredients[k].ingredient,
                                            quantity: orderIngredient.quantity,
                                            pricePerUnit: orderIngredient.pricePerUnit
                                        });
                                    }
                                }
                            }

                            merchant.addOrder(new Order(
                                response[i]._id,
                                response[i].name,
                                response[i].date,
                                response[i].taxes,
                                response[i].fees,
                                ingredients,
                                merchant
                            ));
                        }

                        document.getElementById("orderSubmitForm").onsubmit = ()=>{this.submitFilter(Order)};
                        this.isFetched = true;
                        
                        this.populate();
                        this.isPopulated = true;
                    }
                })
                .catch((err)=>{
                    banner.createError("SOMETHING WENT WRONG. TRY REFRESHING THE PAGE");
                })
                .finally(()=>{
                    loader.style.display = "none";
                });
        }

        if(!this.isPopulated){
            this.populate();
            this.isPopulated = true;
        }
    },

    populate: function(){
        let listDiv = document.getElementById("orderList");
        let template = document.getElementById("order").content.children[0];
        let dateDropdown = document.getElementById("dateDropdownOrder");
        let ingredientDropdown = document.getElementById("ingredientDropdown");

        dateDropdown.style.display = "none";
        ingredientDropdown.style.display = "none";

        document.getElementById("dateFilterBtnOrder").onclick = ()=>{this.toggleDropdown(dateDropdown)};
        document.getElementById("ingredientFilterBtn").onclick = ()=>{this.toggleDropdown(ingredientDropdown)};

        for(let i = 0; i < merchant.ingredients.length; i++){
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.ingredient = merchant.ingredients[i].ingredient;
            ingredientDropdown.appendChild(checkbox);

            let label = document.createElement("label");
            label.innerText = merchant.ingredients[i].ingredient.name;
            label.for = checkbox;
            ingredientDropdown.appendChild(label);

            let brk = document.createElement("br");
            ingredientDropdown.appendChild(brk);
        }

        while(listDiv.children.length > 0){
            listDiv.removeChild(listDiv.firstChild);
        }

        for(let i = 0; i < merchant.orders.length; i++){
            let row = template.cloneNode(true);

            row.children[0].innerText = merchant.orders[i].name;
            row.children[1].innerText = `${merchant.orders[i].ingredients.length} ingredients`;
            row.children[2].innerText = new Date(merchant.orders[i].date).toLocaleDateString("en-US");
            row.children[3].innerText = `$${(merchant.orders[i].getTotalCost() / 100).toFixed(2)}`;
            row.order = merchant.orders[i];
            row.onclick = ()=>{controller.openSidebar("orderDetails", merchant.orders[i])};
            listDiv.appendChild(row);
        }
    },

    submitFilter: function(){
        event.preventDefault();

        let data = {
            startDate: document.getElementById("orderFilDate1").valueAsDate,
            endDate: document.getElementById("orderFilDate2").valueAsDate,
            ingredients: []
        }

        if(data.startDate >= data.endDate){
            banner.createError("START DATE CANNOT BE AFTER END DATE");
            return;
        }

        let ingredientChoices = document.getElementById("ingredientDropdown");
        for(let i = 0; i < ingredientChoices.children.length; i += 3){
            if(ingredientChoices.children[i].checked){
                data.ingredients.push(ingredientChoices.children[i].ingredient.id);
            }
        }

        if(data.ingredients.length === 0){
            for(let i = 0; i < merchant.ingredients.length; i++){
                data.ingredients.push(merchant.ingredients[i].ingredient.id);
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    let orderList = document.getElementById("orderList");
                    let template = document.getElementById("order").content.children[0];

                    while(orderList.children.length > 0){
                        orderList.removeChild(orderList.firstChild);
                    }

                    for(let i = 0; i < response.length; i++){
                        let orderDiv = template.cloneNode(true);
                        let order = new Order(
                            response[i]._id,
                            response[i].name,
                            response[i].date,
                            response[i].taxes,
                            response[i].fees,
                            response[i].ingredients,
                            merchant
                        );

                        let cost = 0;
                        for(let j = 0; j < order.ingredients.length; j++){
                            cost += (order.ingredients[j].price / 100) * order.ingredients[j].quantity;
                        }

                        orderDiv.children[0].innerText = order.name;
                        orderDiv.children[1].innerText = `${order.ingredients.length} items`;
                        orderDiv.children[2].innerText = order.date.toLocaleDateString();
                        orderDiv.children[3].innerText = `$${cost.toFixed(2)}`;
                        orderDiv.onclick = ()=>{controller.openSidebar("orderDetails", order)};
                        orderList.appendChild(orderDiv);
                    }
                }
            })
            .catch((err)=>{
                banner.createError("UNABLE TO DISPLAY THE ORDERS");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    toggleDropdown: function(dropdown){
        event.preventDefault();
        let polyline = dropdown.parentElement.children[0].children[1].children[0].children[0];

        if(dropdown.style.display === "none"){
            dropdown.style.display = "block";
            polyline.setAttribute("points", "18 15 12 9 6 15");
        }else{
            dropdown.style.display = "none";
            polyline.setAttribute("points", "6 9 12 15 18 9");
        }
    }
}

module.exports = orders;
},{}],19:[function(require,module,exports){
let recipeBook = {
    isPopulated: false,
    recipeDivList: [],

    display: function(Recipe){
        if(!this.isPopulated){
            this.populateRecipes();

            if(merchant.pos !== "none"){
                document.getElementById("posUpdateRecipe").onclick = ()=>{this.posUpdate(Recipe)};
            }
            document.getElementById("recipeSearch").oninput = ()=>{this.search()};
            document.getElementById("recipeClearButton").onclick = ()=>{this.clearSorting()};

            this.populateRecipes();

            this.isPopulated = true;
        }
    },

    populateRecipes: function(){
        let recipeList = document.getElementById("recipeList");
        let template = document.getElementById("recipe").content.children[0];

        this.recipeDivList = [];
        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let recipeDiv = template.cloneNode(true);
            recipeDiv.onclick = ()=>{controller.openSidebar("recipeDetails", merchant.recipes[i])};
            recipeDiv._name = merchant.recipes[i].name;
            recipeList.appendChild(recipeDiv);

            recipeDiv.children[0].innerText = merchant.recipes[i].name;
            recipeDiv.children[1].innerText = `$${merchant.recipes[i].price.toFixed(2)}`;

            this.recipeDivList.push(recipeDiv);
        }
    },

    search: function(){
        let input = document.getElementById("recipeSearch").value.toLowerCase();
        let recipeList = document.getElementById("recipeList");
        let clearButton = document.getElementById("recipeClearButton");

        let matchingRecipes = [];
        for(let i = 0; i < this.recipeDivList.length; i++){
            if(this.recipeDivList[i]._name.toLowerCase().includes(input)){
                matchingRecipes.push(this.recipeDivList[i]);
            }
        }

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }
        for(let i = 0; i < matchingRecipes.length; i++){
            recipeList.appendChild(matchingRecipes[i]);
        }

        if(input === ""){
            clearButton.style.display = "none";
        }else{
            clearButton.style.display = "inline";
        }
    },

    clearSorting: function(){
        document.getElementById("recipeSearch").value = "";
        this.search();
    },

    posUpdate: function(Recipe){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";
        let url = `/recipe/update/${merchant.pos}`;

        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
        })
            .then(response => response.json())
            .then((response)=>{
                for(let i = 0; i < response.new.length; i++){
                    const recipe = new Recipe(
                        response.new[i]._id,
                        response.new[i].name,
                        response.new[i].price,
                        merchant,
                        []
                    );

                    merchant.addRecipe(recipe);
                }

                for(let i = 0; i < response.removed.length; i++){
                    const recipe = new Recipe(
                        response.removed[i]._id,
                        response.removed[i].name,
                        response.removed[i].price,
                        merchant,
                        []
                    );

                    merchant.removeRecipe(recipe);
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG.  PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = recipeBook;
},{}],20:[function(require,module,exports){
let recipeDetails = {
    display: function(recipe){
        document.getElementById("editRecipeBtn").onclick = ()=>{controller.openSidebar("editRecipe", recipe)};
        document.getElementById("removeRecipeBtn").onclick = ()=>{this.remove(recipe)};
        document.getElementById("recipeName").innerText = recipe.name;

        //ingredient list
        let ingredientsDiv = document.getElementById("recipeIngredientList");

        while(ingredientsDiv.children.length > 0){
            ingredientsDiv.removeChild(ingredientsDiv.firstChild);
        }

        let template = document.getElementById("recipeIngredient").content.children[0];
        for(let i = 0; i < recipe.ingredients.length; i++){
            let recipeDiv = template.cloneNode(true);
            recipeDiv.children[0].innerText = recipe.ingredients[i].ingredient.name;
            recipeDiv.children[1].innerText = `${recipe.ingredients[i].getQuantityDisplay()}`;
            ingredientsDiv.appendChild(recipeDiv);
        }

        document.getElementById("recipePrice").children[1].innerText = `$${recipe.price.toFixed(2)}`;
    },

    remove: function(recipe){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/merchant/recipes/remove/${recipe.id}`, {
            method: "DELETE"
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.removeRecipe(recipe);

                    banner.createNotification("RECIPE REMOVED");
                    controller.openStrand("recipeBook");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    displayAddIngredient: function(){
        let template = document.getElementById("addRecIngredient").content.children[0].cloneNode(true);
        template.name = "new";
        document.getElementById("recipeIngredientList").appendChild(template);

        let categories = merchant.categorizeIngredients();

        for(let i = 0; i < categories.length; i++){
            let optGroup = document.createElement("optgroup");
            optGroup.label = categories[i].name;
            template.children[0].appendChild(optGroup);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let option = document.createElement("option");
                option.innerText = `${categories[i].ingredients[j].ingredient.name} (${categories[i].ingredients[j].ingredient.unit})`;
                option.ingredient = categories[i].ingredients[j].ingredient;
                optGroup.appendChild(option);
            }
        }
    }
}

module.exports = recipeDetails;
},{}],21:[function(require,module,exports){
let transactionDetails = {
    transaction: {},

    display: function(transaction){
        this.transaction = transaction;

        let recipeList = document.getElementById("transactionRecipes");
        let template = document.getElementById("transactionRecipe").content.children[0];
        let totalRecipes = 0;
        let totalPrice = 0;

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < transaction.recipes.length; i++){
            let recipe = template.cloneNode(true);
            let price = transaction.recipes[i].quantity * transaction.recipes[i].recipe.price;

            recipe.children[0].innerText = transaction.recipes[i].recipe.name;
            recipe.children[1].innerText = `${transaction.recipes[i].quantity} x $${parseFloat(transaction.recipes[i].recipe.price / 100).toFixed(2)}`;
            recipe.children[2].innerText = `$${(price / 100).toFixed(2)}`;
            recipeList.appendChild(recipe);

            totalRecipes += transaction.recipes[i].quantity;
            totalPrice += price;
        }

        let months = ["January", "Fecbruary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let dateString = `${days[transaction.date.getDay()]}, ${months[transaction.date.getMonth()]} ${transaction.date.getDate()}, ${transaction.date.getFullYear()}`;

        document.getElementById("transactionDate").innerText = dateString;
        document.getElementById("transactionTime").innerText = transaction.date.toLocaleTimeString();
        document.getElementById("totalRecipes").innerText = `${totalRecipes} recipes`;
        document.getElementById("totalPrice").innerText = `$${(totalPrice / 100).toFixed(2)}`;

        if(merchant.pos === "none"){
            document.getElementById("removeTransBtn").onclick = ()=>{this.remove()};
        }
    },

    remove: function(){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/transaction/${this.transaction.id}`, {
            method: "delete",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.removeTransaction(this.transaction);
                    banner.createNotification("TRANSACTION REMOVED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },
}

module.exports = transactionDetails;
},{}],22:[function(require,module,exports){
let transactions = {
    isPopulated: false,

    display: function(Transaction){
        if(!this.isPopulated){
            let transactionsList = document.getElementById("transactionsList");
            let dateDropdown = document.getElementById("dateDropdown");
            let recipeDropdown = document.getElementById("recipeDropDown");
            let template = document.getElementById("transaction").content.children[0];

            let now = new Date();
            let monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            document.getElementById("transFilDate1").valueAsDate = monthAgo;
            document.getElementById("transFilDate2").valueAsDate = now;

            dateDropdown.style.display = "none";
            recipeDropdown.style.display = "none";

            document.getElementById("dateFilterBtn").onclick = ()=>{this.toggleDropdown(dateDropdown)};
            document.getElementById("recipeFilterBtn").onclick = ()=>{this.toggleDropdown(recipeDropdown)};

            while(recipeDropdown.children.length > 0){
                recipeDropdown.removeChild(recipeDropdown.firstChild);
            }

            for(let i = 0; i < merchant.recipes.length; i++){
                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.recipe = merchant.recipes[i];
                recipeDropdown.appendChild(checkbox);

                let label = document.createElement("label");
                label.innerText = merchant.recipes[i].name;
                label.for = checkbox;
                recipeDropdown.appendChild(label);

                let brk = document.createElement("br");
                recipeDropdown.appendChild(brk);
            }

            while(transactionsList.children.length > 0){
                transactionsList.removeChild(transactionsList.firstChild);
            }

            let i = 0
            const transactions = merchant.getTransactions();
            while(i < transactions.length && i < 100){
                let transactionDiv = template.cloneNode(true);
                let transaction = transactions[i];

                transactionDiv.onclick = ()=>{controller.openSidebar("transactionDetails", transaction)};
                transactionsList.appendChild(transactionDiv);

                let totalRecipes = 0;
                let totalPrice = 0;

                for(let j = 0; j < transactions[i].recipes.length; j++){
                    totalRecipes += transactions[i].recipes[j].quantity;
                    totalPrice += transactions[i].recipes[j].recipe.price * transactions[i].recipes[j].quantity;
                }

                transactionDiv.children[0].innerText = `${transactions[i].date.toLocaleDateString()} ${transactions[i].date.toLocaleTimeString()}`;
                transactionDiv.children[1].innerText = `${totalRecipes} recipes sold`;
                transactionDiv.children[2].innerText = `$${(totalPrice / 100).toFixed(2)}`;

                i++;
            }

            document.getElementById("transFormSubmit").onsubmit = ()=>{this.submitFilter(Transaction)};

            this.isPopulated = true;
        }
    },

    submitFilter: function(Transaction){
        event.preventDefault();

        let data = {
            startDate: document.getElementById("transFilDate1").valueAsDate,
            endDate: document.getElementById("transFilDate2").valueAsDate,
            recipes: []
        }

        if(data.startDate >= data.endDate){
            banner.createError("START DATE CANNOT BE AFTER END DATE");
            return;
        }

        let recipeChoices = document.getElementById("recipeDropDown");
        for(let i = 0; i < recipeChoices.children.length; i += 3){
            if(recipeChoices.children[i].checked){
                data.recipes.push(recipeChoices.children[i].recipe.id);
            }
        }

        if(data.recipes.length === 0){
            for(let i = 0; i < merchant.recipes.length; i++){
                data.recipes.push(merchant.recipes[i].id);
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    let transactionList = document.getElementById("transactionsList");
                    let template = document.getElementById("transaction").content.children[0];

                    while(transactionList.children.length > 0){
                        transactionList.removeChild(transactionList.firstChild);
                    }

                    for(let i = 0; i < response.length; i++){
                        let transactionDiv = template.cloneNode(true);
                        let recipeCount = 0;
                        let cost = 0;
                        let transaction = new Transaction(
                            response[i]._id,
                            response[i].date,
                            response[i].recipes,
                            merchant
                        );

                        for(let j = 0; j < transaction.recipes.length; j++){
                            recipeCount += transaction.recipes[j].quantity;
                            cost += transaction.recipes[j].quantity * transaction.recipes[j].recipe.price;
                        }

                        transactionDiv.children[0].innerText = `${transaction.date.toLocaleDateString()} ${transaction.date.toLocaleTimeString()}`;
                        transactionDiv.children[1].innerText = `${recipeCount} recipes sold`;
                        transactionDiv.children[2].innerText = `$${(cost / 100).toFixed(2)}`;
                        transactionDiv.onclick = ()=>{controller.openSidebar("transactionDetails", transaction)};
                        transactionList.appendChild(transactionDiv);
                    }
                }
            })
            .catch((err)=>{
                banner.createError("UNABLE TO DISPLAY THE TRANSACTIONS");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    toggleDropdown: function(dropdown){
        event.preventDefault();
        let polyline = dropdown.parentElement.children[0].children[1].children[0].children[0];

        if(dropdown.style.display === "none"){
            dropdown.style.display = "block";
            polyline.setAttribute("points", "18 15 12 9 6 15");
        }else{
            dropdown.style.display = "none";
            polyline.setAttribute("points", "6 9 12 15 18 9");
        }
    }
}

module.exports = transactions;
},{}]},{},[7]);
