(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class Ingredient{
    constructor(id, name, category, unitType, unit, parent, unitSize = undefined){
        this._id = id;
        this._name = name;
        this._category = category;
        this._unitType = unitType;
        this._unit = unit;
        this._parent = parent;
        this._unitSize = unitSize;
    }

    get id(){
        return this._id;
    }

    get name(){
        return this._name;
    }

    set name(name){
        this._name = name;
    }

    get category(){
        return this._category;
    }

    set category(category){
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

    getBaseUnitSize(){
        return this._unitSize;
    }

    getNameAndUnit(){
        return `${this._name} (${this._unit.toUpperCase()})`;
    }

    getPotentialUnits(){
        let mass = ["g", "kg", "oz", "lb"];
        let volume = ["ml", "l", "tsp", "tbsp", "ozfl", "cup", "pt", "qt", "gal"];
        let length = ["mm", "cm", "m", "in", "ft"];

        if(mass.includes(this._unit)){
            return mass;
        }
        if(volume.includes(this._unit)){
            return volume;
        }
        if(length.includes(this._unit)){
            return length;
        }
        if(this._unit === "bottle"){
            return volume;
        }
        return [];

    }
}

module.exports = Ingredient;
},{}],2:[function(require,module,exports){
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
    constructor(oldMerchant, transactions, modules){
        this._modules = modules;
        this._name = oldMerchant.name;
        this._pos = oldMerchant.pos;
        this._ingredients = [];
        this._recipes = [];
        this._transactions = [];
        this._orders = [];
        
        //populate ingredients
        for(let i = 0; i < oldMerchant.inventory.length; i++){
            const ingredient = new modules.Ingredient(
                oldMerchant.inventory[i].ingredient._id,
                oldMerchant.inventory[i].ingredient.name,
                oldMerchant.inventory[i].ingredient.category,
                oldMerchant.inventory[i].ingredient.unitType,
                oldMerchant.inventory[i].defaultUnit,
                this,
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
                            ingredient: this._ingredients[k].ingredient.id,
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

    /*
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
    */
    addIngredient(ingredient, quantity, defaultUnit){
        const createdIngredient = new this._modules.Ingredient(
            ingredient._id,
            ingredient.name,
            ingredient.category,
            ingredient.unitType,
            defaultUnit,
            this,
            ingredient.unitSize
        );

        const merchantIngredient = new MerchantIngredient(createdIngredient, quantity);
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

    getIngredient(id){
        for(let i = 0; i < this._ingredients.length; i++){
            if(this._ingredients[i].ingredient.id === id){
                return this._ingredients[i];
            }
        }
    }

    get recipes(){
        return this._recipes;
    }

    addRecipe(id, name, price, ingredients){
        let recipe = new this._modules.Recipe(id, name, price, ingredients, this);

        this._recipes.push(recipe);

        this._modules.recipeBook.isPopulated = false;
    }

    removeRecipe(recipe){
        const index = this._recipes.indexOf(recipe);
        if(index === undefined){
            return false;
        }

        this._recipes.splice(index, 1);

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

        this._modules.recipeBook.isPopulated = false;
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

    addTransaction(transaction){
        transaction = new this._modules.Transaction(
            transaction._id,
            transaction.date,
            transaction.recipes,
            this
        );

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
                const ingredient = recipe.recipe.ingredients[j];
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
                    this._ingredients[j].updateQuantity(-ingredients[keys[i]]);
                }
            }
        }

        this._modules.home.isPopulated = false;
        this._modules.ingredients.isPopulated = false;
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
                const ingredient = recipe.recipe.ingredients[j];
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
                    this._ingredients[j].updateQuantity(ingredients[keys[i]]);
                    break;
                }
            }
        }

        this._modules.home.isPopulated = false;
        this._modules.ingredients.isPopulated = false;
        this._modules.analytics.newData = true;
    }

    get orders(){
        return this._orders;
    }

    addOrder(data, isNew = false){
        let order = new this._modules.Order(
            data._id,
            data.name,
            data.date,
            data.taxes,
            data.fees,
            data.ingredients,
            this
        );

        this._orders.push(order);

        if(isNew){
            for(let i = 0; i < order.ingredients.length; i++){
                for(let j = 0; j < this._ingredients.length; j++){
                    if(order.ingredients[i].ingredient === this._ingredients[j].ingredient){
                        this._ingredients[j].updateQuantity(order.ingredients[i].quantity);
                        break;
                    }
                }
            }
        }

        this._modules.ingredients.isPopulated = false;
        this._modules.orders.isPopulated = false;
    }

    setOrders(orders){
        this._orders = orders;
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
        if(from === 0){
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
                unit = innerIngredient.unit;
                
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
        switch(this._ingredient.unit){
            case "kg": return this._quantity / 1000;
            case "oz": return this._quantity / 28.3495;
            case "lb": return this._quantity / 453.5924;
            case "ml": return this._quantity * 1000;
            case "tsp": return this._quantity * 202.8842;
            case "tbsp": return this._quantity * 67.6278;
            case "ozfl": return this._quantity * 33.8141;
            case "cup": return this._quantity * 4.1667;
            case "pt": return this._quantity * 2.1134;
            case "qt": return this._quantity * 1.0567;
            case "gal": return this._quantity / 3.7854;
            case "mm": return this._quantity * 1000;
            case "cm": return this._quantity * 100;
            case "in": return this._quantity * 39.3701;
            case "ft": return this._quantity * 3.2808;
            default: return this._quantity;
        }
    }

    updateQuantity(quantity){
        if(quantity < 0){
            return false;
        }

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

    get pricePerUnit(){
        switch(this._ingredient.unit){
            case "g": return this._pricePerUnit / 100;
            case "kg": return (this._pricePerUnit * 1000) / 100; 
            case "oz": return (this._pricePerUnit * 28.3495) / 100; 
            case "lb": return (this._pricePerUnit * 453.5924) / 100; 
            case "ml": return (this._pricePerUnit / 1000) / 100; 
            case "l": return this._pricePerUnit / 100;
            case "tsp": return (this._pricePerUnit / 202.8842) / 100; 
            case "tbsp": return (this._pricePerUnit / 67.6278) / 100; 
            case "ozfl": return (this._pricePerUnit / 33.8141) / 100; 
            case "cup": return (this._pricePerUnit / 4.1667) / 100; 
            case "pt": return (this._pricePerUnit / 2.1134) / 100; 
            case "qt": return (this._pricePerUnit / 1.0567) / 100; 
            case "gal": return (this._pricePerUnit * 3.7854) / 100; 
            case "mm": return (this._pricePerUnit / 1000) / 100; 
            case "cm": return (this._pricePerUnit / 100) / 100; 
            case "m": return this._pricePerUnit / 100;
            case "in": return (this._pricePerUnit / 39.3701) / 100; 
            case "ft": return (this._pricePerUnit / 3.2808) / 100;
            default: return this._pricePerUnit / 100;
        }
    }

    cost(){
        return (this._quantity * this._pricePerUnit) / 100;
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
            for(let j = 0; j < merchant.ingredients.length; j++){
                if(merchant.ingredients[j].ingredient.id === ingredients[i].ingredient){
                    let thing = new OrderIngredient(
                        merchant.ingredients[j].ingredient,
                        ingredients[i].quantity,
                        ingredients[i].pricePerUnit
                    );
                    this._ingredients.push(thing);
                    break;
                }
            }
            
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
        return this._taxes / 100;
    }

    get fees(){
        return this._fees / 100;
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
        return (this.getIngredientCost() + this.taxes + this.fees);
    }
}

module.exports = Order;
},{}],4:[function(require,module,exports){
class RecipeIngredient{
    constructor(ingredient, quantity){
        if(quantity < 0){
            controller.createBanner("QUANTITY CANNOT BE A NEGATIVE NUMBER", "error");
            return false;
        }
        this._ingredient = ingredient;
        this._quantity = quantity;
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
        if(quantity < 0){
            controller.createBanner("QUANTITY CANNOT BE A NEGATIVE NUMBER", "error");
            return false;
        }

        this_quantity = this.convertToBase(quantity);
    }

    getQuantityDisplay(){
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
            controller.createBanner("PRICE CANNOT BE A NEGATIVE NUMBER", "error");
            return false;
        }
        if(!this.isSanitaryString(name)){
            controller.createBanner("NAME CONTAINS ILLEGAL CHARACTERS", "error");
            return false;
        }
        this._id = id;
        this._name = name;
        this._price = price;
        this._parent = parent;
        this._ingredients = [];

        for(let i = 0; i < ingredients.length; i++){
            const ingredient = parent.getIngredient(ingredients[i].ingredient);
            const recipeIngredient = new RecipeIngredient(
                ingredient.ingredient,
                ingredients[i].quantity
            );

            this._ingredients.push(recipeIngredient);
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
            controller.createBanner("QUANTITY CANNOT BE A NEGATIVE NUMBER", "error");
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
            controller.createBanner("QUANTITY CANNOT BE A NEGATIVE NUMBER", "error");
            return false;
        }
        if(quantity % 1 !== 0){
            controller.createBanner("RECIPES WITHIN A TRANSACTION MUST BE WHOLE NUMBERS", "error");
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
            controller.createBanner("DATE CANNOT BE SET TO THE FUTURE", "error");
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

    /*
    Gets the quantity for a given ingredient
    */
    getIngredientQuantity(ingredient){
        let quantity = 0;

        for(let i = 0; i < this._recipes.length; i++){
            const recipe = this._recipes[i].recipe;
            for(let j = 0; j < recipe.ingredients.length; j++){
                if(recipe.ingredients[j].ingredient === ingredient){
                    quantity += recipe.ingredients[j].quantity * this._recipes[i].quantity;

                    break;
                }
            }
        }

        return quantity;
    }
}

module.exports = Transaction;
},{}],6:[function(require,module,exports){
const home = require("./strands/home.js");
const ingredients = require("./strands/ingredients.js");
const recipeBook = require("./strands/recipeBook.js");
const analytics = require("./strands/analytics.js");
const orders = require("./strands/orders.js");
const transactions = require("./strands/transactions.js");

const ingredientDetails = require("./sidebars/ingredientDetails.js");
const newIngredient = require("./sidebars/newIngredient.js");
const editIngredient = require("./sidebars/editIngredient.js");
const newOrder = require("./sidebars/newOrder.js");
const newRecipe = require("./sidebars/newRecipe.js");
const editRecipe = require("./sidebars/editRecipe.js");
const newTransaction = require("./sidebars/newTransaction.js");
const orderDetails = require("./sidebars/orderDetails.js");
const orderFilter = require("./sidebars/orderFilter.js");
const orderCalculator = require("./sidebars/orderCalculator.js");
const recipeDetails = require("./sidebars/recipeDetails.js");
const transactionDetails = require("./sidebars/transactionDetails.js");
const transactionFilter = require("./sidebars/transactionFilter.js");

const Merchant = require("./classes/Merchant.js");
const Ingredient = require("./classes/Ingredient.js");
const Recipe = require("./classes/Recipe.js");
const Order = require("./classes/Order.js");
const Transaction = require("./classes/Transaction.js");

merchant = new Merchant(data.merchant, data.transactions, {
    home: home,
    ingredients: ingredients,
    transactions: transactions,
    recipeBook: recipeBook,
    analytics: analytics,
    orders: orders,
    Ingredient: Ingredient,
    Recipe: Recipe,
    Transaction: Transaction,
    Order: Order
});

controller = {
    openStrand: function(strand, data = undefined){
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
                merchant.setOrders(data);
                orders.display(Order);
                break;
            case "transactions":
                activeButton = document.getElementById("transactionsBtn");
                document.getElementById("transactionsStrand").style.display = "flex";
                transactions.transactions = data;
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
            case "orderFilter":
                orderFilter.display(Order);
                break;
            case "newOrder":
                newOrder.display();
                break;
            case "orderCalculator":
                orderCalculator.display();
                break;
            case "transactionDetails":
                transactionDetails.display(data);
                break;
            case "transactionFilter":
                transactionFilter.display(Transaction);
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
            if(sidebar.children[i].style.display !== "none"){
                sidebar.children[i].style.display = "none";
                let choosables = [];

                switch(sidebar.children[i].id){
                    case "ingredientDetails": 
                        choosables = document.querySelectorAll(".ingredient");
                        break;
                    case "transactionDetails":
                        choosables = document.getElementById("transactionsList").children;
                        break;
                    case "recipeDetails":
                        choosables = document.getElementById("recipeList").children;
                        break;
                    case "orderDetails":
                        choosables = document.getElementById("orderList").children;
                        break;
                }

                for(let i = 0; i < choosables.length; i++){
                    choosables[i].classList.remove("active");
                }
            }
        }
        sidebar.classList = "sidebarHide";

        if(window.screen.availWidth <= 1000){
            document.querySelector(".contentBlock").style.display = "flex";
            document.getElementById("mobileMenuSelector").style.display = "block";
            document.getElementById("sidebarCloser").style.display = "none";
        }
    },

    openModal: function(str){
        let modal = document.getElementById("modal");
        modal.style.display = "flex";
        document.getElementById("modalClose").addEventListener("click", this.closeModal);
        let content = {};

        switch(str){
            case "ingredientSpreadsheet":
                content = document.getElementById("modalSpreadsheetUpload");
                content.style.display = "flex";
                document.getElementById("modalSpreadsheetTitle").innerText = "ingredients";
                document.getElementById("spreadsheetDownload").href = "/ingredients/download/spreadsheet";
                content.onsubmit = newIngredient.submitSpreadsheet;
                break;
            case "recipeSpreadsheet":
                content = document.getElementById("modalSpreadsheetUpload");
                content.style.display = "flex";
                document.getElementById("modalSpreadsheetTitle").innerText = "recipes";
                document.getElementById("spreadsheetDownload").href = "/recipes/download/spreadsheet";
                content.onsubmit = newRecipe.submitSpreadsheet;
                break;
            case "orderSpreadsheet":
                content = document.getElementById("modalSpreadsheetUpload");
                content.style.display = "flex";
                document.getElementById("modalSpreadsheetTitle").innerText = "orders";
                document.getElementById("spreadsheetDownload").href = "/orders/download/spreadsheet";
                content.onsubmit = newOrder.submitSpreadsheet;
                break;
            case "transactionSpreadsheet":
                content = document.getElementById("modalSpreadsheetUpload");
                content.style.display = "flex";
                document.getElementById("modalSpreadsheetTitle").innerText = "transactions";
                document.getElementById("spreadsheetDownload").href = "/transactions/download/spreadsheet";
                content.onsubmit = newTransaction.submitSpreadsheet;
        }
    },

    closeModal: function(){
        let modal = document.getElementById("modal");
        let modalContent = document.getElementById("modalContent");

        for(let i = 0; i < modalContent.children.length; i++){
            modalContent.children[i].style.display = "none";
        }

        modal.style.display = "none";
    },

    createBanner: function(text, status){
        let container = document.getElementById("bannerContainer");
        let template = document.getElementById("banner").content.children[0];
        let banner = template.cloneNode(true);

        switch(status){
            case "error":
                banner.children[0].style.backgroundColor = "rgb(200, 0, 0)";
                banner.children[0].children[0].style.display = "block";
                break;
            case "alert":
                banner.children[0].style.backgroundColor = "rgb(230, 210, 0)";
                banner.children[0].children[1].style.display = "block";
                break;
            case "success":
                banner.children[0].style.backgroundColor = "rgb(0, 145, 55)";
                banner.children[0].children[2].style.display = "block";
                break;
        }

        banner.children[1].innerText = text;
        container.appendChild(banner);

        let timer = setTimeout(()=>{
            container.removeChild(banner);
        }, 10000);

        banner.children[2].addEventListener("click", ()=>{
            container.removeChild(banner);
            clearTimeout(timer);
        });

        
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

    updateAnalytics: function(){
        analytics.isPopulated = false;
    }
}

//Add click listeners for menu buttons
document.getElementById("homeBtn").onclick = ()=>{controller.openStrand("home")};
document.getElementById("ingredientsBtn").onclick = ()=>{controller.openStrand("ingredients")};
document.getElementById("recipeBookBtn").onclick = ()=>{controller.openStrand("recipeBook")};
document.getElementById("analyticsBtn").onclick = ()=>{controller.openStrand("analytics")};
document.getElementById("ordersBtn").onclick = async ()=>{
    if(merchant.orders.length === 0){
        merchant.setOrders(await orders.getOrders(Order));
    }
    controller.openStrand("orders", merchant.orders);
}
document.getElementById("transactionsBtn").onclick = ()=>{controller.openStrand("transactions", merchant.getTransactions())};

controller.openStrand("home");
},{"./classes/Ingredient.js":1,"./classes/Merchant.js":2,"./classes/Order.js":3,"./classes/Recipe.js":4,"./classes/Transaction.js":5,"./sidebars/editIngredient.js":7,"./sidebars/editRecipe.js":8,"./sidebars/ingredientDetails.js":9,"./sidebars/newIngredient.js":10,"./sidebars/newOrder.js":11,"./sidebars/newRecipe.js":12,"./sidebars/newTransaction.js":13,"./sidebars/orderCalculator.js":14,"./sidebars/orderDetails.js":15,"./sidebars/orderFilter.js":16,"./sidebars/recipeDetails.js":17,"./sidebars/transactionDetails.js":18,"./sidebars/transactionFilter.js":19,"./strands/analytics.js":20,"./strands/home.js":21,"./strands/ingredients.js":22,"./strands/orders.js":23,"./strands/recipeBook.js":24,"./strands/transactions.js":25}],7:[function(require,module,exports){
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

        //Make any changes for special ingredients
        if(ingredient.ingredient.unit === "bottle"){
            // quantLabel.innerText = "CURRENT STOCK (BOTTLES):";

            specialLabel.style.display = "flex";
            specialLabel.innerText = `BOTTLE SIZE (${ingredient.ingredient.unitType.toUpperCase()}):`;
            
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

        //Populate the unit buttons
        const units = ingredient.ingredient.getPotentialUnits();

        for(let i = 0; i < units.length; i++){
            let button = document.createElement("button");
            button.classList.add("unitButton");
            button.innerText = units[i].toUpperCase();
            button.onclick = ()=>{this.changeUnit(button)};
            buttonList.appendChild(button);

            if(units[i] === ingredient.ingredient.unitType){
                button.classList.add("unitActive");
            }
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

        data.quantity = quantity;

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
                controller.createBanner(response, "error");
            }else{
                merchant.removeIngredient(merchant.getIngredient(response.ingredient._id));
                merchant.addIngredient(response.ingredient, response.quantity, response.unit);

                controller.openStrand("ingredients");
                controller.createBanner("INGREDIENT UPDATED", "success");
            }
        })
        .catch((err)=>{
            controller.createBanner("SOMETHING WENT WRONG, PLEASE REFRESH THE PAGE", "error");
        })
        .finally(()=>{
            loader.style.display = "none";
        });
    }
}

module.exports = editIngredient;
},{}],8:[function(require,module,exports){
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
            let newIngredient = {};
            let ingredient = {};

            if(ingredients[i].children[1].style.display === "none"){
                let selector = ingredients[i].children[2];
                ingredient = selector.options[selector.selectedIndex].ingredient;

                newIngredient = {
                    ingredient: ingredient.ingredient.id,
                    quantity: ingredient.convertToBase(quantity)
                };
            }else{
                ingredient = ingredients[i].ingredient;

                newIngredient = {
                    ingredient: ingredient.ingredient.id,
                    quantity: ingredients[i].ingredient.convertToBase(quantity)
                };
            }

            data.ingredients.push(newIngredient);
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
                    controller.createBanner(response, "error");
                }else{
                    merchant.updateRecipe(response);
                    controller.openStrand("recipeBook");
                    controller.createBanner("RECIPE UPDATED", "success");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG, PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = editRecipe;
},{}],9:[function(require,module,exports){
let ingredientDetails = {
    dailyUse: 0,

    display: function(ingredient){
        document.getElementById("editIngBtn").onclick = ()=>{controller.openSidebar("editIngredient", ingredient)};
        document.getElementById("removeIngBtn").onclick = ()=>{this.remove(ingredient)};
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
        dailyUseDiv.innerText = `${dailyUse.toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;

        //Show recipes that this ingredient is a part of
        let recipeList = document.getElementById("ingredientRecipeList");
        let template = document.getElementById("ingredientRecipe").content.children[0];
        let recipes = merchant.getRecipesForIngredient(ingredient.ingredient);

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < recipes.length; i++){
            let recipeDiv = template.cloneNode(true);
            recipeDiv.children[0].innerText = recipes[i].name;
            recipeDiv.onclick = ()=>{
                controller.openStrand("recipeBook");
                controller.openSidebar("recipeDetails", recipes[i]);
            }
            recipeDiv.classList.add("choosable");
            recipeList.appendChild(recipeDiv);
        }
    },

    remove: function(ingredient){
        for(let i = 0; i < merchant.recipes.length; i++){
            for(let j = 0; j < merchant.recipes[i].ingredients.length; j++){
                if(ingredient.ingredient === merchant.recipes[i].ingredients[j].ingredient){
                    controller.createBanner("MUST REMOVE INGREDIENT FROM ALL RECIPES BEFORE REMOVING FROM INVENTORY", "error");
                    return;
                }
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/ingredients/remove/${ingredient.ingredient.id}`, {
            method: "delete",
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    merchant.removeIngredient(ingredient);
                    
                    controller.openStrand("ingredients");
                    controller.createBanner("INGREDIENT REMOVED", "success");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = ingredientDetails;
},{}],10:[function(require,module,exports){
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
        document.getElementById("ingredientFileUpload").addEventListener("click", ()=>{controller.openModal("ingredientSpreadsheet")});
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

    submit: function(){
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
            newIngredient.ingredient.unitType = document.getElementById("bottleUnits").value;
            newIngredient.ingredient.unitSize = parseFloat(document.getElementById("bottleSize").value);
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
                    controller.createBanner(response, "error");
                }else{
                    merchant.addIngredient(response.ingredient, response.quantity, response.defaultUnit);
                    controller.openStrand("ingredients");

                    controller.createBanner("INGREDIENT CREATED", "success");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    submitSpreadsheet: function(){
        event.preventDefault();
        controller.closeModal();

        const file = document.getElementById("spreadsheetInput").files[0];
        let data = new FormData();
        data.append("ingredients", file);

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/ingredients/create/spreadsheet", {
            method: "post",
            body: data
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    for(let i = 0; i < response.length; i++){
                        merchant.addIngredient(response[i].ingredient, response[i].quantity, response[i].defaultUnit);
                    }

                    controller.createBanner("INGREDIENTS SUCCESSFULLY ADDED", "success");
                    controller.openStrand("ingredients");
                }
                
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG.  TRY REFRESHING THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = newIngredient;
},{}],11:[function(require,module,exports){
let newOrder = {
    display: function(){
        document.getElementById("sidebarDiv").classList.add("sidebarWide");
        document.getElementById("newOrderIngredientList").style.display = "flex";
        document.getElementById("orderFileUpload").addEventListener("click", ()=>{controller.openModal("orderSpreadsheet")});

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
            ingredient.classList = "choosable";
            ingredient.innerText = merchant.ingredients[i].ingredient.name;
            ingredient.onclick = ()=>{this.addIngredient(merchant.ingredients[i], ingredient)};
            ingredientList.appendChild(ingredient);
        }

        document.getElementById("submitNewOrder").onclick = ()=>{this.submit()};
    },

    addIngredient: function(ingredient, element){
        element.style.display = "none";

        let div = document.getElementById("selectedIngredient").content.children[0].cloneNode(true);
        div.ingredient = ingredient;
        div.children[0].children[1].onclick = ()=>{this.removeIngredient(div, element)};

        div.children[0].children[0].innerText = `${ingredient.ingredient.name} (${ingredient.ingredient.unit.toUpperCase()})`;

        document.getElementById("selectedIngredientList").appendChild(div);
    },

    removeIngredient: function(selectedElement, element){
        selectedElement.parentElement.removeChild(selectedElement);
        element.style.display = "block";
    },

    submit: function(){
        let date = document.getElementById("newOrderDate").valueAsDate;
        let taxes = document.getElementById("orderTaxes").value * 100;
        let fees = document.getElementById("orderFees").value * 100;
        let ingredients = document.getElementById("selectedIngredientList").children;
        
        if(date === null){
            controller.createBanner("DATE IS REQUIRED FOR ORDERS", "error");
            return;
        }
    
        date.setHours(0, 0, 0, 0);

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

            data.ingredients.push({
                ingredient: ingredients[i].ingredient.ingredient.id,
                quantity: ingredients[i].ingredient.convertToBase(quantity),
                pricePerUnit: this.convertPrice(ingredients[i].ingredient.ingredient, price * 100)
            });
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
                    controller.createBanner(response, "error");
                }else{
                    merchant.addOrder(response, true);
                    
                    controller.openStrand("orders", merchant.orders);
                    controller.createBanner("NEW ORDER CREATED", "success");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG, PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    convertPrice: function(ingredient, price){
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
            default: return price;
        }
    },

    submitSpreadsheet: function(){
        event.preventDefault();
        controller.closeModal();

        const file = document.getElementById("spreadsheetInput").files[0];
        let data = new FormData();
        data.append("orders", file);
        data.append("timeOffset", new Date().getTimezoneOffset());

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/orders/create/spreadsheet", {
            method: "post",
            body: data
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    merchant.addOrder(response, true);

                    controller.createBanner("ORDER CREATED AND INGREDIENTS UPDATED SUCCESSFULLY", "success");
                    controller.openStrand("orders");
                }
            })
            .catch((err)=>{
                controller.createBanner("UNABLE TO DISPLAY NEW ORDER. PLEASE REFRESH THE PAGE.", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = newOrder;
},{}],12:[function(require,module,exports){
let newRecipe = {
    display: function(Recipe){
        document.getElementById("newRecipeName").value = "";
        document.getElementById("newRecipePrice").value = "";
        document.getElementById("ingredientCount").value = 1;

        let categories = merchant.categorizeIngredients();

        let ingredientsSelect = document.getElementById("recipeInputIngredients");
        while(ingredientsSelect.children.length > 0){
            ingredientsSelect.removeChild(ingredientsSelect.firstChild);
        }

        this.changeIngredientCount(categories);

        document.getElementById("ingredientCount").onchange = ()=>{this.changeIngredientCount(categories)};
        document.getElementById("submitNewRecipe").onclick = ()=>{this.submit(Recipe)};
        document.getElementById("recipeFileUpload").onclick = ()=>{controller.openModal("recipeSpreadsheet")};
    },

    //Updates the number of ingredient inputs displayed for new recipes
    changeIngredientCount: function(categories){
        let newCount = document.getElementById("ingredientCount").value;
        let ingredientsDiv = document.getElementById("recipeInputIngredients");
        let template = document.getElementById("recipeInputIngredient").content.children[0];
        let oldCount = ingredientsDiv.children.length;

        if(newCount > oldCount){
            let newDivs = newCount - oldCount;

            for(let i = 0; i < newDivs; i++){
                let newNode = template.cloneNode(true);
                newNode.children[0].innnerText = `INGREDIENT ${i + oldCount}`;
                newNode.children[2].children[0].value = 0;

                for(let j = 0; j < categories.length; j++){
                    let optgroup = document.createElement("optgroup");
                    optgroup.label = categories[j].name;

                    for(let k = 0; k < categories[j].ingredients.length; k++){
                        let option = document.createElement("option");
                        option.innerText = categories[j].ingredients[k].ingredient.getNameAndUnit();
                        option.ingredient = categories[j].ingredients[k];
                        optgroup.appendChild(option);
                    }

                    newNode.children[1].children[0].appendChild(optgroup);
                }

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

        let inputs = document.getElementById("recipeInputIngredients").children;
        for(let i = 0; i < inputs.length; i++){
            let sel = inputs[i].children[1].children[0];
            let ingredient = sel.options[sel.selectedIndex].ingredient;

            let newIngredient = {
                ingredient: ingredient.ingredient.id,
                quantity: ingredient.convertToBase(inputs[i].children[2].children[0].value)
            };

            newRecipe.ingredients.push(newIngredient);
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
                    controller.createBanner(response, "error");
                }else{
                    let ingredients = [];
                    for(let i = 0; i < response.ingredients.length; i++){
                        for(let j = 0; j < merchant.ingredients.length; j++){
                            if(merchant.ingredients[j].ingredient.id === response.ingredients[i].ingredient){
                                ingredients.push({
                                    ingredient: merchant.ingredients[j].ingredient.id,
                                    quantity: response.ingredients[i].quantity
                                });

                                break;
                            }
                        }
                    }

                    merchant.addRecipe(
                        response._id,
                        response.name,
                        response.price,
                        ingredients
                    );

                    controller.createBanner("RECIPE CREATED", "success");
                    controller.openStrand("recipeBook");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    submitSpreadsheet: function(){
        event.preventDefault();
        controller.closeModal();

        const file = document.getElementById("spreadsheetInput").files[0];
        let data = new FormData();
        data.append("recipes", file);

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/recipes/create/spreadsheet", {
            method: "post",
            body: data
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    for(let i = 0; i < response.length; i++){
                        merchant.addRecipe(
                            response[i]._id,
                            response[i].name,
                            response[i].price,
                            response[i].ingredients
                        );
                    }

                    controller.createBanner("ALL INGREDIENTS SUCCESSFULLY CREATED", "success");
                    controller.openStrand("recipeBook");
                }
            })
            .catch((err)=>{
                controller.createBanner("UNABLE TO DISPLAY NEW RECIPES.  PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = newRecipe;
},{}],13:[function(require,module,exports){
let newTransaction = {
    display: function(){
        let recipeList = document.getElementById("newTransactionRecipes");
        let template = document.getElementById("createTransaction").content.children[0];
        document.getElementById("transactionFileUpload").addEventListener("click", ()=>{controller.openModal("transactionSpreadsheet")});

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let recipeDiv = template.cloneNode(true);
            recipeDiv.recipe = merchant.recipes[i];
            recipeList.appendChild(recipeDiv);

            recipeDiv.children[0].innerText = merchant.recipes[i].name;
        }

        document.getElementById("submitNewTransaction").onclick = ()=>{this.submit()};
    },

    submit: function(){
        let recipeDivs = document.getElementById("newTransactionRecipes");
        let date = document.getElementById("newTransactionDate").valueAsDate;

        if(date === null){
            controller.createBanner("DATE IS REQUIRED FOR TRANSACTIONS", "error");
            return;
        }

        date.setHours(0, 0, 0, 0);
        
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

                for(let j = 0; j < recipe.ingredients.length; j++){
                    let ingredient = recipe.ingredients[j];
                    if(data.ingredientUpdates[ingredient.ingredient.id]){
                        data.ingredientUpdates[ingredient.ingredient.id] += ingredient.convertToBase(ingredient.quantity) * quantity;
                    }else{
                        data.ingredientUpdates[ingredient.ingredient.id] = ingredient.convertToBase(ingredient.quantity) * quantity;
                    }
                }
            }else if(quantity < 0){
                controller.createBanner("CANNOT HAVE NEGATIVE VALUES", "error");
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
                        controller.createBanner(response, "error");
                    }else{
                        merchant.addTransaction(response);

                        controller.updateAnalytics();
                        controller.openStrand("transactions", merchant.getTransactions());
                        controller.createBanner("TRANSACTION CREATED", "success");
                    }
                })
                .catch((err)=>{
                    controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
                })
                .finally(()=>{
                    loader.style.display = "none";
                });
        }
    },

    submitSpreadsheet: function(){
        event.preventDefault();
        controller.closeModal();

        const file = document.getElementById("spreadsheetInput").files[0];
        let data = new FormData();
        data.append("transactions", file);
        data.append("timeOffset", new Date().getTimezoneOffset());

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/transactions/create/spreadsheet", {
            method: "post",
            body: data
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    for(let i = 0; i < response.recipes.length; i++){
                        response.recipes[i].recipe = response.recipes[i].recipe._id;
                    }
                    merchant.addTransaction(response);
                    controller.updateAnalytics();

                    controller.openStrand("transactions", merchant.transactions);
                    controller.createBanner("TRANSACTION SUCCESSFULLY CREATED.  INGREDIENTS UPDATED", "success");
                }
            })
            .catch((err)=>{
                controller.createBanner("UNABLE TO DISPLAY NEW TRANSACTIONS.  PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = newTransaction;
},{}],14:[function(require,module,exports){
let orderCalculator = {
    display: function(){
        let calculatorItems = document.getElementById("calculatorItemsBody");
        let template = document.getElementById("calculatorItem").content.children[0];
        let calculations = this.predict();

        while(calculatorItems.children.length > 0){
            calculatorItems.removeChild(calculatorItems.firstChild);
        }

        for(let i = 0; i < calculations.length; i++){
            let outputString = `${calculations[i].output.toFixed(2)} ${calculations[i].ingredient.unit.toUpperCase()}`;
        
            let item = template.cloneNode(true);
            item.children[0].innerText = calculations[i].ingredient.name,
            item.children[1].innerText = outputString;
            calculatorItems.appendChild(item);
        }
    },

    predict: function(){
        let now = new Date();
        let yesterday = new Date();
        yesterday.setHours(0, 0, 0, 0);
        let monthAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        let weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    
        let calculations = [];

        let month = merchant.getIngredientsSold(monthAgo, yesterday);
        let week = merchant.getIngredientsSold(weekAgo, yesterday);

        let weights = {
            month: 0.33,
            week: 0.67
        }

        for(let i = 0; i < month.length; i++){
            for(let j = 0; j < week.length; j++){
                if(month[i].ingredient.id === week[j].ingredient.id){
                    let monthAverage = (month[i].quantity / 30) * weights.month;
                    let weekAverage = (week[i].quantity / 7) * weights.week;

                    let calc = {
                        ingredient: month[i].ingredient,
                        output: monthAverage + weekAverage
                    };
                    calculations.push(calc);
                }
            }
        }

        return calculations;
    }
}

module.exports = orderCalculator;
},{}],15:[function(require,module,exports){
let orderDetails = {
    display: function(order){
        document.getElementById("removeOrderBtn").onclick = ()=>{this.remove(order)};

        document.getElementById("orderDetailName").innerText = order.name;
        document.getElementById("orderDetailDate").innerText = order.date.toLocaleDateString("en-US");
        document.getElementById("orderDetailTax").innerText = `$${order.taxes.toFixed(2)}`;
        document.getElementById("orderDetailFee").innerText = `$${order.fees.toFixed(2)}`;

        let ingredientList = document.getElementById("orderIngredients");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.getElementById("orderIngredient").content.children[0];
        for(let i = 0; i < order.ingredients.length; i++){
            let ingredientDiv = template.cloneNode(true);
            const ingredient = order.ingredients[i].ingredient;
            
            ingredientDiv.children[0].innerText = order.ingredients[i].ingredient.name;
            ingredientDiv.children[2].innerText = `$${order.ingredients[i].cost().toFixed(2)}`;
            ingredientDiv.onclick = ()=>{
                controller.openStrand("ingredients");
                controller.openSidebar("ingredientDetails", merchant.getIngredient(order.ingredients[i].ingredient.id));
            }
            
            let ingredientDisplay = ingredientDiv.children[1];
            ingredientDisplay.innerText = `${order.ingredients[i].quantity.toFixed(2)} ${ingredient.unit.toUpperCase()} X $${order.ingredients[i].pricePerUnit.toFixed(2)}`;

            ingredientList.appendChild(ingredientDiv);
        }

        document.getElementById("orderDetailTotal").innerText = `$${order.getIngredientCost().toFixed(2)}`;
        document.querySelector("#orderTotalPrice p").innerText = `$${order.getTotalCost().toFixed(2)}`;
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
                    controller.createBanner(response, "error");
                }else{
                    merchant.removeOrder(order);

                    controller.openStrand("orders", merchant.orders);
                    controller.createBanner("ORDER REMOVED", "success");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = orderDetails;
},{}],16:[function(require,module,exports){
let orderFilter = {
    display: function(Order){
        let now = new Date();
        let past = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        let ingredientList = document.getElementById("orderFilterIngredients");

        document.getElementById("orderFilterDateFrom").valueAsDate = past;
        document.getElementById("orderFilterDateTo").valueAsDate = now;

        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        for(let i = 0; i < merchant.ingredients.length; i++){
            let element = document.createElement("div");
            element.classList.add("choosable");
            element.ingredient = merchant.ingredients[i].ingredient.id;
            element.onclick = ()=>{this.toggleActive(element)};
            ingredientList.appendChild(element);

            let text = document.createElement("p");
            text.innerText = merchant.ingredients[i].ingredient.name;
            element.appendChild(text);
        }

        document.getElementById("orderFilterSubmit").onclick = ()=>{this.submit(Order)};
    },

    toggleActive: function(element){
        if(element.classList.contains("active")){
            element.classList.remove("active");
        }else{
            element.classList.add("active");
        }
    },

    submit: function(Order){
        let data = {
            from: document.getElementById("orderFilterDateFrom").valueAsDate,
            to: document.getElementById("orderFilterDateTo").valueAsDate,
            ingredients: []
        }

        data.from.setHours(0, 0, 0, 0);
        data.to.setHours(0, 0, 0, 0);

        let ingredients = document.getElementById("orderFilterIngredients").children;
        for(let i = 0; i < ingredients.length; i++){
            if(ingredients[i].classList.contains("active")){
                data.ingredients.push(ingredients[i].ingredient);
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/orders/get", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then((response)=>{
            let orders = [];
            if(typeof(response) === "string"){
                controller.createBanner(response, "error");
            }else if(response.length === 0){
                controller.createBanner("NO ORDERS MATCH YOUR SEARCH", "error");
            }else{
                for(let i = 0; i < response.length; i++){
                    orders.push(new Order(
                        response[i]._id,
                        response[i].name,
                        response[i].date,
                        response[i].taxes,
                        response[i].fees,
                        response[i].ingredients,
                        merchant
                    ));
                }
            }

            controller.openStrand("orders", orders);
        })
        .catch((err)=>{
            controller.createBanner("UNABLE TO DISPLAY THE ORDERS", "error");
        })
        .finally(()=>{
            loader.style.display = "none";
        });
    }
}

module.exports = orderFilter;
},{}],17:[function(require,module,exports){
let recipeDetails = {
    display: function(recipe){
        document.getElementById("editRecipeBtn").onclick = ()=>{controller.openSidebar("editRecipe", recipe)};
        document.getElementById("recipeName").innerText = recipe.name;
        if(merchant.pos === "none"){
            document.getElementById("removeRecipeBtn").onclick = ()=>{this.remove(recipe)};
        }

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
            recipeDiv.onclick = ()=>{
                controller.openStrand("ingredients");
                controller.openSidebar("ingredientDetails", merchant.getIngredient(recipe.ingredients[i].ingredient.id));
            }
            ingredientsDiv.appendChild(recipeDiv);
        }

        document.getElementById("recipePrice").children[1].innerText = `$${recipe.price.toFixed(2)}`;
    },

    remove: function(recipe){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/recipe/remove/${recipe.id}`, {
            method: "delete"
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    merchant.removeRecipe(recipe);

                    controller.createBanner("RECIPE REMOVED", "success");
                    controller.openStrand("recipeBook");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = recipeDetails;
},{}],18:[function(require,module,exports){
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
            recipe.children[1].innerText = `${transaction.recipes[i].quantity} x $${transaction.recipes[i].recipe.price.toFixed(2)}`;
            recipe.children[2].innerText = `$${price.toFixed(2)}`;
            recipe.onclick = ()=>{
                controller.openStrand("recipeBook");
                controller.openSidebar("recipeDetails", transaction.recipes[i].recipe);
            }
            recipeList.appendChild(recipe);

            totalRecipes += transaction.recipes[i].quantity;
            totalPrice += price;
        }

        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let dateString = `${days[transaction.date.getDay()]}, ${months[transaction.date.getMonth()]} ${transaction.date.getDate()}, ${transaction.date.getFullYear()}`;

        document.getElementById("transactionDate").innerText = dateString;
        document.getElementById("totalRecipes").innerText = `${totalRecipes} recipes`;
        document.getElementById("totalPrice").innerText = `$${totalPrice.toFixed(2)}`;

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
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    merchant.removeTransaction(this.transaction);
                    controller.updateAnalytics();

                    controller.openStrand("transactions", merchant.getTransactions());
                    controller.createBanner("TRANSACTION REMOVED", "success");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },
}

module.exports = transactionDetails;
},{}],19:[function(require,module,exports){
let transactionFilter = {
    display: function(Transaction){
        //Set default dates
        let today = new Date();
        let monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);

        document.getElementById("transFilterDateStart").valueAsDate = monthAgo;
        document.getElementById("transFilterDateEnd").valueAsDate = today;

        //populate recipes
        let recipeList = document.getElementById("transFilterRecipeList");

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let recipe = document.createElement("div");
            recipe.innerText = merchant.recipes[i].name;
            recipe.recipe = merchant.recipes[i];
            recipe.classList.add("choosable");
            recipe.onclick = ()=>{this.toggleActive(recipe)};
            recipeList.appendChild(recipe);
        }

        //Submit button
        document.getElementById("transFilterSubmit").onclick = ()=>{this.submit(Transaction)};
    },

    toggleActive: function(element){
        if(element.classList.contains("active")){
            element.classList.remove("active");
        }else{
            element.classList.add("active");
        }
    },

    submit: function(Transaction){
        let data = {
            from: document.getElementById("transFilterDateStart").valueAsDate,
            to: document.getElementById("transFilterDateEnd").valueAsDate,
            recipes: []
        }

        data.from.setHours(0, 0, 0, 0);
        data.to.setHours(0, 0, 0, 0);

        if(data.startDate >= data.endDate){
            controller.createBanner("START DATE CANNOT BE AFTER END DATE", "error");
            return;
        }

        let recipes = document.getElementById("transFilterRecipeList").children;
        for(let i = 0; i < recipes.length; i++){
            if(recipes[i].classList.contains("active")){
                data.recipes.push(recipes[i].recipe.id);
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/transaction", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response)=>{
                let transactions = [];
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else if(response.length === 0){
                    controller.createBanner("NO TRANSACTIONS MATCH YOUR SEARCH", "error");
                }else{
                    for(let i = 0; i < response.length; i++){
                        transactions.push(new Transaction(
                            response[i]._id,
                            response[i].date,
                            response[i].recipes,
                            merchant
                        ));
                    }
                }

                controller.openStrand("transactions", transactions);
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = transactionFilter;
},{}],20:[function(require,module,exports){
let analytics = {
    isPopulated: false,
    ingredient: undefined,
    recipe: undefined,
    transactionsByDate: [],

    display: function(Transaction){
        if(!this.isPopulated){
            document.getElementById("analRecipeContent").style.display = "none";

            let to = new Date()
            let from = new Date(to.getFullYear(), to.getMonth() - 1, to.getDate());

            document.getElementById("analStartDate").valueAsDate = from;
            document.getElementById("analEndDate").valueAsDate = to;
            let analSlider = document.getElementById("analSlider");
            analSlider.onclick = ()=>{this.switchDisplay()};
            analSlider.checked = false;
            document.getElementById("analDateBtn").onclick = ()=>{this.newDates(Transaction)};

            this.populateButtons();

            if(merchant.ingredients.length > 0){
                this.ingredient = merchant.ingredients[0].ingredient;
            }
            if(merchant.recipes.length > 0){
                this.recipe = merchant.recipes[0];
            }
            
            this.newDates(Transaction);
            
            this.isPopulated = true;
        }
    },

    populateButtons: function(){
        let ingredientButtons = document.getElementById("analIngredientList");
        let recipeButtons = document.getElementById("analRecipeList");

        while(ingredientButtons.children.length > 0){
            ingredientButtons.removeChild(ingredientButtons.firstChild);
        }

        for(let i = 0; i < merchant.ingredients.length; i++){
            let button = document.createElement("button");
            button.innerText = merchant.ingredients[i].ingredient.name;
            button.classList.add("choosable");
            button.onclick = ()=>{
                this.ingredient = merchant.ingredients[i].ingredient;
                this.displayIngredient();
            };
            ingredientButtons.appendChild(button);
        }

        while(recipeButtons.children.length > 0){
            recipeButtons.removeChild(recipeButtons.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let button = document.createElement("button");
            button.innerText = merchant.recipes[i].name;
            button.classList.add("choosable");
            button.onclick = ()=>{
                this.recipe = merchant.recipes[i];
                this.displayRecipe();
            };
            recipeButtons.appendChild(button);
        }
    },

    getData: function(from, to, Transaction){
        let data = {
            from: from,
            to: to,
            recipes: []
        }
        
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        return fetch("/transaction", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    this.transactionsByDate = [];
                    response.reverse();

                    let startOfDay = new Date(from.getTime());
                    startOfDay.setHours(0, 0, 0, 0);
                    let endOfDay = new Date(from.getTime());
                    endOfDay.setDate(endOfDay.getDate() + 1);
                    endOfDay.setHours(0, 0, 0, 0);
                    
                    let transactionIndex = 0;
                    while(startOfDay <= to){
                        let currentTransactions = [];

                        while(transactionIndex < response.length && new Date(response[transactionIndex].date) < endOfDay){
                            currentTransactions.push(new Transaction(
                                response[transactionIndex]._id,
                                response[transactionIndex].date,
                                response[transactionIndex].recipes,
                                merchant
                            ));

                            transactionIndex++;
                        }

                        let thing = {
                            date: new Date(startOfDay.getTime()),
                            transactions: currentTransactions
                        };
                        this.transactionsByDate.push(thing);

                        startOfDay.setDate(startOfDay.getDate() + 1);
                        endOfDay.setDate(endOfDay.getDate() + 1);
                    }
                }
            })
            .catch((err)=>{
                controller.createBanner("UNABLE TO UPDATE THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    displayIngredient: function(){
        if(this.ingredient === undefined  || this.transactionsByDate.length === 0){
            return;
        }

        //break down data into dates and quantities
        let dates = [];
        let quantities = [];

        for(let i = 0; i < this.transactionsByDate.length; i++){
            dates.push(this.transactionsByDate[i].date);

            let sum = 0;
            for(let j = 0; j < this.transactionsByDate[i].transactions.length; j++){
                let transaction = this.transactionsByDate[i].transactions[j];
                sum += transaction.getIngredientQuantity(this.ingredient);
            }
            
            quantities.push(sum);
        }

        //create and display the graph
        let trace = {
            x: dates,
            y: quantities,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107)"
            }
        }

        let yaxis = `QUANTITY (${this.ingredient.unit.toUpperCase()})`;

        const layout = {
            title: this.ingredient.name.toUpperCase(),
            xaxis: {title: "DATE"},
            yaxis: {title: yaxis}
        }

        Plotly.newPlot("itemUseGraph", [trace], layout);

        //Create min/max/avg
        //Current ingredient is stored on the "analMinUse" element
        let min = quantities[0];
        let max = quantities[0];
        let sum = 0;
        for(let i = 0; i < quantities.length; i++){
            if(quantities[i] < min){
                min = quantities[i];
            }
            if(quantities[i] > max){
                max = quantities[i];
            }

            sum += quantities[i];
        }

        document.getElementById("analMinUse").innerText = `${min.toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
        document.getElementById("analAvgUse").innerText = `${(sum / quantities.length).toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
        document.getElementById("analMaxUse").innerText = `${max.toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;

        //Create weekday averages
        let dayUse = [0, 0, 0, 0, 0, 0, 0];
        let dayCount = [0, 0, 0, 0, 0, 0, 0];
        for(let i = 0; i < quantities.length; i++){
            dayUse[dates[i].getDay()] += quantities[i];
            dayCount[dates[i].getDay()]++;
        }

        document.getElementById("analDayOne").innerText = `${(dayUse[0] / dayCount[0]).toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
        document.getElementById("analDayTwo").innerText = `${(dayUse[1] / dayCount[1]).toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
        document.getElementById("analDayThree").innerText = `${(dayUse[2] / dayCount[2]).toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
        document.getElementById("analDayFour").innerText = `${(dayUse[3] / dayCount[3]).toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
        document.getElementById("analDayFive").innerText = `${(dayUse[4] / dayCount[4]).toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
        document.getElementById("analDaySix").innerText = `${(dayUse[5] / dayCount[5]).toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
        document.getElementById("analDaySeven").innerText = `${(dayUse[6] / dayCount[6]).toFixed(2)} ${this.ingredient.unit.toUpperCase()}`;
    },

    displayRecipe: function(){
        if(this.recipe === undefined || this.transactionsByDate.length === 0){
            return;
        }

        //break down data into dates and quantities
        let dates = [];
        let quantities = [];

        for(let i = 0; i < this.transactionsByDate.length; i++){
            dates.push(this.transactionsByDate[i].date);
            let sum = 0;

            for(let j = 0; j < this.transactionsByDate[i].transactions.length; j++){
                const transaction = this.transactionsByDate[i].transactions[j];

                for(let k = 0; k < transaction.recipes.length; k++){
                    if(transaction.recipes[k].recipe === this.recipe){
                        sum += transaction.recipes[k].quantity;
                    }
                }
            }

            quantities.push(sum);
        }
        
        //create and display the graph
        const trace = {
            x: dates,
            y: quantities,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107)"
            }
        }

        const layout = {
            title: this.recipe.name.toUpperCase(),
            xaxis: {title: "DATE"},
            yaxis: {title: "QUANTITY"}
        }

        Plotly.newPlot("recipeSalesGraph", [trace], layout);

        //Display the boxes at the bottom
        //Current recipe is stored on the "recipeAvgUse" element
        let avg = 0;
        for(let i = 0; i < quantities.length; i++){
            avg += quantities[i];
        }
        avg = avg / quantities.length;

        document.getElementById("recipeAvgUse").innerText = avg.toFixed(2);
        document.getElementById("recipeAvgRevenue").innerText = `$${(avg * this.recipe.price).toFixed(2)}`;
    },

    switchDisplay: function(){
        const checkbox = document.getElementById("analSlider");
        let ingredient = document.getElementById("analIngredientContent");
        let recipe = document.getElementById("analRecipeContent");

        if(checkbox.checked === true){
            ingredient.style.display = "none";
            recipe.style.display = "flex";
            this.displayRecipe();
        }else{
            ingredient.style.display = "flex";
            recipe.style.display = "none";
            this.displayIngredient();
        }
    },

    newDates: async function(Transaction){
        const from = document.getElementById("analStartDate").valueAsDate;
        const to = document.getElementById("analEndDate").valueAsDate;
        from.setHours(0, 0, 0, 0);
        to.setDate(to.getDate() + 1);
        to.setHours(0, 0, 0, 0);

        await this.getData(from, to, Transaction);

        if(document.getElementById("analSlider").checked === true){
            this.displayRecipe();
        }else{
            this.displayIngredient();
        }
    }
}

module.exports = analytics;
},{}],21:[function(require,module,exports){
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

            input.value = ingredient.quantity.toFixed(2);
            ingredientCheck.children[2].innerText = ingredient.ingredient.unit.toUpperCase();
            
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

            if(screen.width < 1000){
                layout.margin = {
                    l: 10,
                    r: 10,
                    t: 100,
                    b: 100
                };
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

        let data = [];

        for(let i = 0; i < lis.length; i++){
            if(lis[i].children[1].children[1].value >= 0){
                if(lis[i].children[1].children[1].changed === true){
                    let merchIngredient = lis[i].ingredient;
                    data.push({
                        id: merchIngredient.ingredient.id,
                        quantity: lis[i].children[1].children[1].value
                    });

                    lis[i].children[1].children[1].changed = false;
                }
            }else{
                controller.createBanner("CANNOT HAVE NEGATIVE INGREDIENTS", "error");
                return;
            }
        }
        
        if(data.length > 0){
            let loader = document.getElementById("loaderContainer");
            loader.style.display = "flex";

            fetch("/merchant/ingredients/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        controller.createBanner(response, "error");
                    }else{
                        for(let i = 0; i < response.length; i++){
                            merchant.removeIngredient(merchant.getIngredient(response[i].ingredient._id));
                            merchant.addIngredient(response[i].ingredient, response[i].quantity, response[i].defaultUnit);
                        }
                        controller.createBanner("INGREDIENTS UPDATED", "success");
                    }
                })
                .catch((err)=>{
                    controller.createBanner("SOMETHING WENT WRONG.  PLEASE REFRESH THE PAGE", "error");
                })
                .finally(()=>{
                    loader.style.display = "none";
                });
        }
    }
}

module.exports = home;
},{}],22:[function(require,module,exports){
let ingredients = {
    isPopulated: false,
    ingredients: [],

    display: function(){
        if(!this.isPopulated){
            document.getElementById("ingredientSearch").oninput = ()=>{this.search()};

            this.populateByProperty();

            this.isPopulated = true;
        }
    },

    populateByProperty: function(){
        let categories;
        categories = merchant.categorizeIngredients();
        
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
            
            categoryDiv.children[0].onclick = ()=>{
                this.toggleCategory(categoryDiv.children[1], categoryDiv.children[0].children[1]);
            };
            categoryDiv.children[1].style.display = "none";
            ingredientStrand.appendChild(categoryDiv);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let ingredient = categories[i].ingredients[j];
                let ingredientDiv = ingredientTemplate.cloneNode(true);

                ingredientDiv.children[0].innerText = ingredient.ingredient.name;
                ingredientDiv.onclick = ()=>{
                    controller.openSidebar("ingredientDetails", ingredient);
                    ingredientDiv.classList.add("active");
                };
                ingredientDiv._name = ingredient.ingredient.name.toLowerCase();
                ingredientDiv._unit = ingredient.ingredient.unit.toLowerCase();
                
                ingredientDiv.children[2].innerText = `${ingredient.quantity.toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;

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

        if(input === ""){
            this.populateByProperty();
            return;
        }

        let matchingIngredients = [];
        for(let i = 0; i < this.ingredients.length; i++){
            if(this.ingredients[i]._name.includes(input)){
                matchingIngredients.push(this.ingredients[i]);
            }
        }

        this.displayIngredientsOnly(matchingIngredients);
    }
}

module.exports = ingredients;
},{}],23:[function(require,module,exports){
let orders = {
    display: function(){
        document.getElementById("orderFilterBtn").addEventListener("click", ()=>{controller.openSidebar("orderFilter")});
        document.getElementById("newOrderBtn").addEventListener("click", ()=>{controller.openSidebar("newOrder")});
        document.getElementById("orderCalcBtn").addEventListener("click", ()=>{controller.openSidebar("orderCalculator")});

        let orderList = document.getElementById("orderList");
        let template = document.getElementById("order").content.children[0];

        while(orderList.children.length > 0){
            orderList.removeChild(orderList.firstChild);
        }

        for(let i = 0; i < merchant.orders.length; i++){
            let orderDiv = template.cloneNode(true);
            orderDiv.order = merchant.orders[i];
            orderDiv.children[0].innerText = merchant.orders[i].name;
            orderDiv.children[1].innerText = `${merchant.orders[i].ingredients.length} ingredients`;
            orderDiv.children[2].innerText = merchant.orders[i].date.toLocaleDateString("en-US");
            orderDiv.children[3].innerText = `$${merchant.orders[i].getTotalCost().toFixed(2)}`;
            orderDiv.onclick = ()=>{
                controller.openSidebar("orderDetails", merchant.orders[i]);
                orderDiv.classList.add("active");
            }
            orderList.appendChild(orderDiv);
        }
    },

    getOrders: function(Order){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        let to = new Date();
        let from = new Date(to.getFullYear(), to.getMonth(), to.getDate() - 30);
        from.setHours(0, 0, 0, 0);

        let body = {
            to: to.toUTCString(),
            from: from.toUTCString(),
            ingredients: []};

        return fetch("/orders/get", {
            method: "post",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    let orders = [];

                    for(let i = 0; i < response.length; i++){
                        orders.push(new Order(
                            response[i]._id,
                            response[i].name,
                            response[i].date,
                            response[i].taxes,
                            response[i].fees,
                            response[i].ingredients,
                            merchant
                        ));
                    }

                    if(merchant.orders.length === 0){
                        merchant.setOrders(orders);
                    }

                    return orders;
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = orders;
},{}],24:[function(require,module,exports){
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
            recipeDiv.onclick = ()=>{
                controller.openSidebar("recipeDetails", merchant.recipes[i]);
                recipeDiv.classList.add("active");
            }
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
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
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
                        for(let j = 0; j < merchant.recipes.length; j++){
                            if(merchant.recipes[j].id === response.removed[i]._id){
                                merchant.removeRecipe(merchant.recipes[j]);
                                break;
                            }
                        }
                    }

                    controller.createBanner("RECIPES SUCCESSFULLY UPDATED", "success");
                    this.display();
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG.  PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = recipeBook;
},{}],25:[function(require,module,exports){
let transactions = {
    transactions: [],

    display: function(){
        document.getElementById("filterTransactionsButton").onclick = ()=>{controller.openSidebar("transactionFilter")};
        document.getElementById("newTransactionButton").onclick = ()=>{controller.openSidebar("newTransaction")};

        this.populateTransactions(this.transactions);

        this.isPopulated = true;
    },

    populateTransactions: function(transactions){
        let transactionsList = document.getElementById("transactionsList");
        let template = document.getElementById("transaction").content.children[0];

        while(transactionsList.children.length > 0){
            transactionsList.removeChild(transactionsList.firstChild);
        }

        let i = 0;
        while(i < transactions.length && i < 100){
            let transactionDiv = template.cloneNode(true);
            let transaction = transactions[i];

            transactionDiv.onclick = ()=>{
                controller.openSidebar("transactionDetails", transaction);
                transactionDiv.classList.add("active");
            }
            transactionsList.appendChild(transactionDiv);

            let totalRecipes = 0;
            let totalPrice = 0;

            for(let j = 0; j < transactions[i].recipes.length; j++){
                totalRecipes += transactions[i].recipes[j].quantity;
                totalPrice += transactions[i].recipes[j].recipe.price * transactions[i].recipes[j].quantity;
            }

            transactionDiv.children[0].innerText = transactions[i].date.toLocaleDateString();
            transactionDiv.children[1].innerText = `${totalRecipes} recipes sold`;
            transactionDiv.children[2].innerText = `$${totalPrice.toFixed(2)}`;

            i++;
        }
    }
}

module.exports = transactions;
},{}]},{},[6]);
