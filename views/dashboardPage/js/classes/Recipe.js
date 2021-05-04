const recipeBook = require("../strands/recipeBook.js");
const analytics = require("../strands/analytics.js");

class RecipeIngredient{
    constructor(ingredient, quantity){
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
        this_quantity = controller.baseUnit(quantity, this._ingredient.unit);
    }

    getQuantityDisplay(){
        return `${this.quantity.toFixed(2)} ${this._ingredient.unit.toUpperCase()}`;
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
        this._name = name;
    }

    get price(){
        return this._price / 100;
    }

    set price(price){
        this._price = price;
    }

    get parent(){
        return this._parent;
    }

    get ingredients(){
        return this._ingredients;
    }

    addIngredient(ingredient, quantity){
        let recipeIngredient = new RecipeIngredient(ingredient, quantity);
        this._ingredients.push(recipeIngredient);

        recipeBook.isPopulated = false;
        analytics.isPopulated = false;
    }

    removeIngredients(){
        this._ingredients = [];
    }
}

module.exports = Recipe;