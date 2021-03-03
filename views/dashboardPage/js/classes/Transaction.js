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