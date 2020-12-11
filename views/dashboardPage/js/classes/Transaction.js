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
                }
            }
        }

        return quantity;
    }
}

module.exports = Transaction;