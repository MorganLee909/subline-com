class TransactionRecipe{
    constructor(recipe, quantity, merchant){
        this.recipe = merchant.getRecipe(recipe, true);
        this.quantity = quantity;
    }
}

class Transaction{
    constructor(id, date, recipes, parent){
        this.id = id;
        this.date = new Date(date);
        this.recipes = [];

        for(let i = 0; i < recipes.length; i++){
            this.recipes.push(new TransactionRecipe(
                recipes[i].recipe,
                recipes[i].quantity,
                parent
            ));
        }
    }

    /*
    Gets the quantity for a given ingredient
    */
    getIngredientQuantity(ingredient, isDisplay = false){
        let total = 0;

        for(let i = 0; i < this.recipes.length; i++){
            total += this.recipes[i].recipe.getIngredientTotal(ingredient.id) * this.recipes[i].quantity;
        }

        return total;
    }

    /*
    Gets the quantity for a given recipe
    */
   getRecipeQuantity(recipe){
        for(let i = 0; i < this.recipes.length; i++){
           if(this.recipes[i].recipe === recipe) return this.recipes[i].quantity;
        }
        return 0;
    }
}

module.exports = Transaction;