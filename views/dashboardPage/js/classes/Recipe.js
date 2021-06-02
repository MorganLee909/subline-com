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
    constructor(id, name, category, price, ingredients, parent, hidden){
        this._id = id;
        this._name = name;
        this._category = category;
        this._price = price;
        this._parent = parent;
        this._hidden = hidden;
        this._ingredients = [];
        this._ingredientTotals = {};

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

    get category(){
        return this._category;
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

    get hidden(){
        return this._hidden;
    }

    set hidden(hidden){
        this._hidden = hidden;
    }

    get ingredients(){
        return this._ingredients;
    }

    get ingredientTotals(){
        return this._ingredientTotals;
    }

    getIngredientTotal(id){
        return (this._ingredientTotals[id] === undefined) ? 0 : this._ingredientTotals[id];
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

    calculateIngredientTotals(){
        let traverseIngredient = (ingredient, multiplier)=>{
            for(let i = 0; i < ingredient.subIngredients.length; i++){
                traverseIngredient(ingredient.subIngredients[i].ingredient, multiplier * ingredient.subIngredients[i].quantity);                
            }

            if(this._ingredientTotals[ingredient.id] === undefined){
                this._ingredientTotals[ingredient.id] = multiplier;
            }else{
                this._ingredientTotals[ingredient.id] += multiplier;
            }
        }

        for(let i = 0; i < this._ingredients.length; i++){
            traverseIngredient(this._ingredients[i]._ingredient, this._ingredients[i].quantity);
        }
    }
}

module.exports = Recipe;