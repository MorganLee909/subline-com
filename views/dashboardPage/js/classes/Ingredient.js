class SubIngredient{
    constructor(id, ingredient, quantity, unit, parent){
        this.id = id;
        this._ingredient = ingredient;
        this._quantity = quantity;
        this.unit = unit;
        this._parent = parent;
    }

    get ingredient(){
        return merchant.getIngredient(this._ingredient).ingredient;
    }

    get quantity(){
        let subQuantity = this._quantity * controller.unitMultiplier(controller.getBaseUnit(this.unit), this.unit);
        let parentMultiplier = controller.unitMultiplier(controller.getBaseUnit(this._ingredient.unit), this._ingredient.unit);

        return subQuantity / parentMultiplier;
    }

    getDisplayQuantity(){
        return `${parseFloat(this.quantity.toFixed(2))} ${this.unit} / ${this._parent.unit}`;
    }
}

class Ingredient{
    constructor(id, name, category, unit, subIngredients, convert, parent){
        this._id = id;
        this._name = name;
        this._category = category;
        this.unit = unit;
        this._subIngredients = [];
        this._parent = parent;
        this._convert = convert;

        for(let i = 0; i < subIngredients.length; i++){
            this._subIngredients.push(new SubIngredient(
                subIngredients[i]._id,
                subIngredients[i].ingredient,
                subIngredients[i].quantity,
                subIngredients[i].unit,
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

    getPotentialUnits(){
        switch(controller.getUnitType(this.unit)){
            case "mass": return ["g", "kg", "oz", "lb"];
            case "volume": return ["ml", "l", "tsp", "tbsp", "ozfl", "cup", "pt", "qt", "gal"];
            case "length": return ["mm", "cm", "m", "in", "ft"];
        }
    }
}

module.exports = Ingredient;