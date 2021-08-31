class SubIngredient{
    constructor(id, ingredient, quantity, unit, parent){
        this.id = id;
        this._ingredient = ingredient;
        this._quantity = quantity;
        this.unit = unit;
        this.parent = parent;
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
        return `${parseFloat(this.quantity.toFixed(2))} ${this.unit} / ${this.parent.unit}`;
    }
}

class Ingredient{
    constructor(id, name, category, unit, altUnit, subIngredients, convert, parent){
        this.id = id;
        this.name = name;
        this.category = category;
        this.unit = unit;
        this.altUnit = altUnit;
        this.subIngredients = [];
        this.parent = parent;
        this.convert = convert;

        for(let i = 0; i < subIngredients.length; i++){
            this.subIngredients.push(new SubIngredient(
                subIngredients[i].id,
                subIngredients[i].ingredient,
                subIngredients[i].quantity,
                subIngredients[i].unit,
                this
            ));
        }
    }

    addIngredients(ingredients){
        for(let i = 0; i < ingredients.length; i++){
            this.subIngredients.push(new SubIngredient(
                ingredients[i].id,
                ingredients[i].ingredient,
                ingredients[i].quantity,
                ingredients[i].unit,
                this
            ));
        }
    }

    replaceIngredients(ingredients){
        this.subIngredients = [];

        this.addIngredients(ingredients);
    }

    getUnitCost(){
        let totalCost = 0;
        let quantity = 0;

        for(let i = 0; i < this.parent.orders.length; i++){
            for(let j = 0; j < this.parent.orders[i].ingredients.length; j++){
                let ingredient = this.parent.orders[i].ingredients[j];

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
            case "bottle": return ["ml", "l", "tsp", "tbsp", "ozfl", "cup", "pt", "qt", "gal"];
            case "each": return ["each"];
        }
    }
}

module.exports = Ingredient;