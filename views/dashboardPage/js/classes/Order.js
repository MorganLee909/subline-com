class OrderIngredient{
    constructor(ingredient, quantity, pricePerUnit){
        this.ingredient = merchant.getIngredient(ingredient).ingredient;
        this._quantity = quantity;
        this._pricePerUnit = pricePerUnit;
    }

    get quantity(){
        switch(this.ingredient.unit){
            case "kg": return this._quantity / 1000;
            case "oz": return this._quantity / 28.3495;
            case "lb": return this._quantity / 453.5924;
            case "ml": return this._quantity * 1000;
            case "tsp": return this._quantity * 202.8842;
            case "tbsp": return this._quantity * 67.6278;
            case "ozfl": return this._quantity * 33.8141;
            case "cup": return this._quantity * 4.1667;
            case "pt": return this._quantity * 2.1134;
            case "qt": return this._quantity * 1.0567;
            case "gal": return this._quantity / 3.7854;
            case "mm": return this._quantity * 1000;
            case "cm": return this._quantity * 100;
            case "in": return this._quantity * 39.3701;
            case "ft": return this._quantity * 3.2808;
            case "bottle": return this._quantity * this.ingredient.convert.toBottle;
            default: return this._quantity;
        }
    }

    updateQuantity(quantity){
        quantity *= controller.unitMultiplier(unit, controller.getBaseUnit(unit))
        switch(controller.getUnitType(this.ingredient.unit)){
            case "mass": quantity /= this.ingredient.convert.toMass; break;
            case "volume": quantity /= this.ingredient.convert.toVolume; break;
            case "length": quantity /= this.ingredient.convert.toLength; break;
        }
        this._quantity += quantity;
    }

    get pricePerUnit(){
        switch(this.ingredient.unit){
            case "g": return this._pricePerUnit / 100;
            case "kg": return (this._pricePerUnit * 1000) / 100; 
            case "oz": return (this._pricePerUnit * 28.3495) / 100; 
            case "lb": return (this._pricePerUnit * 453.5924) / 100; 
            case "ml": return (this._pricePerUnit / 1000) / 100; 
            case "l": return this._pricePerUnit / 100;
            case "tsp": return (this._pricePerUnit / 202.8842) / 100; 
            case "tbsp": return (this._pricePerUnit / 67.6278) / 100; 
            case "ozfl": return (this._pricePerUnit / 33.8141) / 100; 
            case "cup": return (this._pricePerUnit / 4.1667) / 100; 
            case "pt": return (this._pricePerUnit / 2.1134) / 100; 
            case "qt": return (this._pricePerUnit / 1.0567) / 100; 
            case "gal": return (this._pricePerUnit * 3.7854) / 100; 
            case "mm": return (this._pricePerUnit / 1000) / 100; 
            case "cm": return (this._pricePerUnit / 100) / 100; 
            case "m": return this._pricePerUnit / 100;
            case "in": return (this._pricePerUnit / 39.3701) / 100; 
            case "ft": return (this._pricePerUnit / 3.2808) / 100;
            case "bottle": return (this._pricePerUnit / this.ingredient.convert.toBottle) / 100;
            default: return this._pricePerUnit / 100;
        }
    }

    get pricePerBaseUnit(){
        return this._pricePerUnit;
    }

    cost(){
        return (this._quantity * this._pricePerUnit) / 100;
    }
        
}

/*
Order Object
id = id of order in the database
name = name/id of order, if any
date = Date Object for when the order was created
taxes = User entered taxes associated with the order
fees = User entered fees associated with the order
ingredients = [{
    ingredient: Ingredient ID,
    quantity: quantity of ingredient sold,
    pricePerUnit: price of purchase (per base unit)
}]
parent = the merchant that it belongs to
*/
class Order{
    constructor(id, name, date, taxes, fees, ingredients, parent){
        this.id = id;
        this.name = name;
        this.date = new Date(date);
        this._taxes = taxes;
        this._fees = fees;
        this.ingredients = [];
        this.parent = parent;

        for(let i = 0; i < ingredients.length; i++){
            this.ingredients.push(new OrderIngredient(
                ingredients[i].ingredient,
                ingredients[i].quantity,
                ingredients[i].pricePerUnit
            ));
        }
    }

    get taxes(){
        return this._taxes / 100;
    }

    get fees(){
        return this._fees / 100;
    }

    get ingredients(){
        return this.ingredients;
    }

    getIngredientCost(){
        let sum = 0;
        for(let i = 0; i < this.ingredients.length; i++){
            sum += this.ingredients[i].cost();
        }
        return sum;
    }

    getTotalCost(){
        return (this.getIngredientCost() + this.taxes + this.fees);
    }
}

module.exports = Order;