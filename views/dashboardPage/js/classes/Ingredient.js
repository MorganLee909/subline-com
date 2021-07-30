class SubIngredient{
    constructor(id, ingredient, quantity, parent){
        this.id = id;
        this._ingredient = ingredient;
        this.quantity = quantity;
        this.parent = parent;
    }

    get ingredient(){
        return merchant.getIngredient(this._ingredient).ingredient;
    }

    getDisplayQuantity(){
        let mult = controller.unitMultiplier(controller.getUnitType(this.parent.unit), this.parent.unit);
        return `${this.quantity * mult} ${this.unit} / ${this.parent.unit}`;
    }
}

class Ingredient{
    constructor(id, name, category, unit, subIngredients, convert, parent){
        this._id = id;
        this._name = name;
        this._category = category;
        this._unit = unit;
        this._subIngredients = [];
        this._parent = parent;
        this._convert = convert;

        for(let i = 0; i < subIngredients.length; i++){
            this._subIngredients.push(new SubIngredient(
                subIngredients[i]._id,
                subIngredients[i].ingredient,
                subIngredients[i].quantity,
                this
            ));
        }
    }

    get id(){
        return this._id;
    }
    
    set id(id){
        this._id = id;
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

    get unit(){
        return this._unit;
    }

    set unit(unit){
        this._unit = unit;
    }

    get convert(){
        return this._convert;
    }

    get subIngredients(){
        return this._subIngredients;
    }

    addIngredients(ingredients){
        for(let i = 0; i < ingredients.length; i++){
            this._subIngredients.push({
                ingredient: this._parent.getIngredient(ingredients[i].ingredient).ingredient,
                quantity: ingredients[i].quantity
            });
        }
    }

    replaceIngredients(ingredients){
        this._subIngredients = [];

        this.addIngredients(ingredients);
    }

    getUnitCost(){
        let totalCost = 0;
        let quantity = 0;

        for(let i = 0; i < this._parent.orders.length; i++){
            for(let j = 0; j < this._parent.orders[i].ingredients.length; j++){
                let ingredient = this._parent.orders[i].ingredients[j];

                if(ingredient.ingredient === this){
                    totalCost += ingredient.pricePerUnit * ingredient.quantity;
                    quantity += ingredient.quantity;
                    break;
                }
            }
        }

        return (quantity === 0) ? 0 : totalCost / quantity;
    }
}

module.exports = Ingredient;