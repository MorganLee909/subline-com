class TransactionRecipe{
    constructor(recipe, quantity, merchant){
        this._recipe = merchant.getRecipe(recipe);
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
        this._id = id;
        this._date = new Date(date);
        this._recipes = [];

        for(let i = 0; i < recipes.length; i++){
            this._recipes.push(new TransactionRecipe(
                recipes[i].recipe,
                recipes[i].quantity,
                parent
            ));
        }
    }

    get id(){
        return this._id;
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
        let traverseIngredient = (transIngredient)=>{
            let total = 0;
            for(let i = 0; i < transIngredient.subIngredients.length; i++){
                if(transIngredient.subIngredients[i].ingredient === ingredient) return transIngredient.subIngredients[i].quantity;
                total += traverseIngredient(transIngredient.subIngredients[i].ingredient) * transIngredient.subIngredients[i].quantity;
            }

            return total;
        }

        let quantity = 0;

        for(let i = 0; i < this._recipes.length; i++){
            for(let j = 0; j < this._recipes[i].recipe.ingredients.length; j++){
                let transIngredient = this._recipes[i].recipe.ingredients[j];
                let multiplier = (ingredient === transIngredient.ingredient) ? 1 : traverseIngredient(transIngredient.ingredient);
                quantity += multiplier * transIngredient.quantity * this._recipes[i].quantity;
            }
        }

        return quantity;
    }
}

module.exports = Transaction;