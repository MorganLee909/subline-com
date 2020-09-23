class Order{
    constructor(id, name, date, taxes, fees, ingredients, parent){
        this.id = id;
        this.name = name;
        this.date = new Date(date);
        this.ingredients = [];
        this.parent = parent;

        for(let i = 0; i < ingredients.length; i++){
            for(let j = 0; j < parent.ingredients.length; j++){
                if(ingredients[i].ingredient === parent.ingredients[j].ingredient.id){
                    this.ingredients.push({
                        ingredient: parent.ingredients[j].ingredient,
                        quantity: ingredients[i].quantity,
                        pricePerUnit: ingredients[i].pricePerUnit
                    });

                    break;
                }
            }
        }
    }
}

module.exports = Order;