const recipeBook = require("../strands/recipeBook.js");
const analytics = require("../strands/analytics.js");

class RecipeIngredient{
    constructor(ingredient, quantity, unit){
        this.ingredient = ingredient;
        this._quantity = quantity;
        this.unit = unit;
    }

    get quantity(){
        return this._quantity * controller.unitMultiplier(controller.getBaseUnit(this.unit), this.unit);
    }

    set quantity(quantity){
        this._quantity = quantity;
    }

    getQuantityDisplay(){
        return `${this.quantity.toFixed(2)} ${this.unit.toUpperCase()}`;
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
        this.id = id;
        this.name = name;
        this.category = category;
        this._price = price;
        this.parent = parent;
        this.hidden = hidden;
        this.ingredients = [];
        //Ingredient totals is the total amount of each ingredient within the recipe, converted to ingredient base unit
        this.ingredientTotals = {};

        for(let i = 0; i < ingredients.length; i++){
            let ingredient = parent.getIngredient(ingredients[i].ingredient);
            let recipeIngredient = new RecipeIngredient(
                ingredient.ingredient,
                ingredients[i].quantity,
                ingredients[i].unit,
            );

            this.ingredients.push(recipeIngredient);
        }
    }

    get price(){
        return this._price / 100;
    }

    set price(price){
        this._price = price;
    }

    clearIngredients(){
        this.ingredients = [];
    }

    //Returns the quantity of a single ingredient with the recipe.
    //Returns the quantity converted to the base unit of the ingredient
    getIngredientTotal(id){
        if(this.ingredientTotals[id] === undefined) return 0;

        let ingredient = merchant.getIngredient(id).ingredient;
        let ingredientTotal = this.ingredientTotals[id];
        let toIngredientBase = 0;

        switch(controller.getBaseUnit(controller.getBaseUnit(ingredient.unit))){
            case "g": toIngredientBase = ingredient.convert.toMass; break;
            case "l": toIngredientBase = ingredient.convert.toVolume; break;
            case "m": toIngredientBase = ingredient.convert.toLength; break;
        }
        return ingredientTotal / toIngredientBase;
    }

    addIngredient(ingredient, quantity, unit, baseUnitMultiplier){
        let recipeIngredient = new RecipeIngredient(ingredient, quantity, unit, baseUnitMultiplier);
        this.ingredients.push(recipeIngredient);

        recipeBook.isPopulated = false;
        analytics.isPopulated = false;
    }

    //Ingredient totals are stored as base of the recipeIngredient unit
    calculateIngredientTotals(){
        this.ingredientTotals = {};

        let traverseIngredient = (ingredient, multiplier)=>{
            for(let i = 0; i < ingredient.subIngredients.length; i++){
                traverseIngredient(ingredient.subIngredients[i].ingredient, multiplier * ingredient.subIngredients[i]._quantity);
            }

            if(this.ingredientTotals[ingredient.id] === undefined){
                this.ingredientTotals[ingredient.id] = multiplier;
            }else{
                this.ingredientTotals[ingredient.id] += multiplier;
            }
        }

        for(let i = 0; i < this.ingredients.length; i++){
            traverseIngredient(this.ingredients[i].ingredient, this.ingredients[i]._quantity);
        }
    }
}

module.exports = Recipe;