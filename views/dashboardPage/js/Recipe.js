class RecipeIngredient{
    constructor(ingredient, quantity){
        if(quantity < 0){
            banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER");
            return false;
        }
        this._ingredient = ingredient;
        this._quantity = this.convertToBase(quantity);
    }

    get ingredient(){
        return this._ingredient;
    }

    get quantity(){
        switch(unit){
            case "g":return this._quantity;
            case "kg": return this._quantity * 1000;
            case "oz": return this._quantity * 28.3495;
            case "lb": return this._quantity * 453.5924;
            case "ml": return this._quantity / 1000;
            case "l": return this._quantity;
            case "tsp": return this._quantity / 202.8842;
            case "tbsp": return this._quantity / 67.6278;
            case "ozfl": return this._quantity / 33.8141;
            case "cup": return this._quantity / 4.1667;
            case "pt": return this._quantity / 2.1134;
            case "qt": return this._quantity / 1.0567;
            case "gal": return this._quantity * 3.7854;
            case "mm": return this._quantity / 1000;
            case "cm": return this._quantity / 100;
            case "m": return this._quantity;
            case "in": return this._quantity / 39.3701;
            case "ft": return this._quantity / 3.2808;
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
}

class Recipe{
    constructor(id, name, price, ingredients, parent){
        if(price < 0){
            banner.createError("PRICE CANNOT BE A NEGATIVE NUMBER");
            return false;
        }
        if(!controller.sanitaryString(name)){
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
        this._parent.modules.recipeBook.display();
    }

    get id(){
        return this._id;
    }

    get name(){
        return this._name;
    }

    set name(name){
        if(!controller.sanitaryString(name)){
            return false;
        }

        this._name = name;
    }

    get price(){
        return this._price;
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
        this._parent.modules.recipeBook.display();
    }

    removeIngredient(ingredient){
        const index = this._ingredients.indexOf(ingredient);

        this._ingredients.splice(index, 1);
    }

    updateIngredient(ingredient, quantity){
        if(quantity < 0){
            banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER");
            return false;
        }
        const index = this._ingredients.indoxOf(ingredient);

        this._ingredients[index].quantity = quantity;
    }
}

module.exports = Recipe;