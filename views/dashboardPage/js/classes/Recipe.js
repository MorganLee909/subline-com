const recipeBook = require("../strands/recipeBook.js");
const analytics = require("../strands/analytics.js");

class RecipeIngredient{
    constructor(ingredient, quantity, unit){
        this._ingredient = ingredient;
        this._quantity = quantity;
        this._unit = unit;
    }

    get ingredient(){
        return this._ingredient;
    }

    get quantity(){
        return this._quantity;
    }

    set quantity(quantity){
        quantity *= controller.unitMultiplier(unit, controller.getBaseUnit(unit))
        switch(controller.getUnitType(this._ingredient.unit)){
            case "mass": quantity /= this._ingredient.convert.toMass; break;
            case "volume": quantity /= this._ingredient.convert.toVolume; break;
            case "length": quantity /= this._ingredient.convert.toLength; break;
        }
        this._quantity += quantity;
    }

    get unit(){
        return this._unit;
    }

    getQuantityDisplay(){
        return `${this._quantity.toFixed(2)} ${this._unit.toUpperCase()}`;
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
    unit: String
    baseUnitmultiplier: Number
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
        //Ingredient totals is the total amount of each ingredient within the recipe, converted to ingredient base unit
        this._ingredientTotals = {};

        for(let i = 0; i < ingredients.length; i++){
            const ingredient = parent.getIngredient(ingredients[i].ingredient);
            const recipeIngredient = new RecipeIngredient(
                ingredient.ingredient,
                ingredients[i].quantity,
                ingredients[i].unit,
                ingredients[i].baseUnitMultiplier
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

    set category(category){
        this._category = category;
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

    clearIngredients(){
        this._ingredients = [];
    }

    get ingredientTotals(){
        return this._ingredientTotals;
    }

    //Returns the quantity of a single ingredient with the recipe.
    //Returns the quantity converted to the base unit of the ingredient
    getIngredientTotal(id, isDisplay = false){
        if(isDisplay === true){
            for(let i = 0; i < this._ingredients.length; i++){
                if(this._ingredients[i].ingredient.id === id){
                    return (this._ingredientTotals[id] === undefined) ? 0 : controller.displayUnit(this._ingredientTotals[id], this._ingredients[i].ingredient.unit);
                }
                break;
            }
        }
        return (this._ingredientTotals[id] === undefined) ? 0 : this._ingredientTotals[id];
    }

    addIngredient(ingredient, quantity, unit, baseUnitMultiplier){
        let recipeIngredient = new RecipeIngredient(ingredient, quantity, unit, baseUnitMultiplier);
        this._ingredients.push(recipeIngredient);

        recipeBook.isPopulated = false;
        analytics.isPopulated = false;
    }

    removeIngredients(){
        this._ingredients = [];
    }

    calculateIngredientTotals(){
        this._ingredientTotals = {};

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
            traverseIngredient(this._ingredients[i]._ingredient, this._ingredients[i].getQuantityAsBase());
        }
    }
}

module.exports = Recipe;