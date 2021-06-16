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
        let total = 0;
        for(let i = 0; i < this._recipes.length; i++){
            total += this._recipes[i].recipe.getIngredientTotal(ingredient.id) * this._recipes[i].quantity;
        }

        return total;
    }

    getIngredientQuantityBase(ingredient){
        let total = 0;
        for(let i = 0; i < this._recipes.length; i++){
            console.log(total);
            total += this._recipes[i].recipe.getIngredientTotalBase(ingredient.id) * this._recipes[i].quantity;
            console.log(total);
        }

        return total;
    }

    /*
    Gets the quantity for a given recipe
    */
   getRecipeQuantity(recipe){
        for(let i = 0; i < this._recipes.length; i++){
           if(this._recipes[i].recipe === recipe) return this._recipes[i].quantity;
        }
        return 0;
    }
}

module.exports = Transaction;