class OrderIngredient{
    constructor(ingredient, quantity, pricePerUnit){
        if(quantity < 0){
            return false;
        }
        this._ingredient = ingredient;
        this._quantity = quantity;
        this._pricePerUnit = pricePerUnit;
    }

    get ingredient(){
        return this._ingredient;
    }

    get quantity(){
        if(this._ingredient.specialUnit === "bottle"){
            return this._quantity / this._ingredient.unitSize;
        }

        switch(this._ingredient.unit){
            case "g":return this._quantity;
            case "kg": return this._quantity / 1000;
            case "oz": return this._quantity / 28.3495;
            case "lb": return this._quantity / 453.5924;
            case "ml": return this._quantity * 1000;
            case "l": return this._quantity;
            case "tsp": return this._quantity * 202.8842;
            case "tbsp": return this._quantity * 67.6278;
            case "ozfl": return this._quantity * 33.8141;
            case "cup": return this._quantity * 4.1667;
            case "pt": return this._quantity * 2.1134;
            case "qt": return this._quantity * 1.0567;
            case "gal": return this._quantity / 3.7854;
            case "mm": return this._quantity * 1000;
            case "cm": return this._quantity * 100;
            case "m": return this._quantity;
            case "in": return this._quantity * 39.3701;
            case "ft": return this._quantity * 3.2808;
            default: return this._quantity;
        }
    }

    convertToBase(quantity){
        switch(this._ingredient.unit){
            case "g": return quantity;
            case "kg": return quantity / 1000; 
            case "oz":  return quantity / 28.3495; 
            case "lb":  return quantity / 453.5924;
            case "ml": return quantity *= 1000; 
            case "l": return quantity;
            case "tsp": return quantity * 202.8842; 
            case "tbsp": return quantity * 67.6278; 
            case "ozfl": return quantity * 33.8141; 
            case "cup": return quantity * 4.1667; 
            case "pt": return quantity * 2.1134; 
            case "qt": return quantity * 1.0567; 
            case "gal": return quantity / 3.7854;
            case "mm": return quantity * 1000; 
            case "cm": return quantity * 100; 
            case "m": return quantity;
            case "in": return quantity * 39.3701; 
            case "ft": return quantity * 3.2808;
            default: return quantity;
        }
    }

    get pricePerUnit(){
        if(this._ingredient.specialUnit === "bottle"){
            return (this._pricePerUnit * this._ingredient.unitSize) / 100;
        }

        switch(this._ingredient.unit){
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
        }
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
    ingredient: Ingredient Object,
    quantity: quantity of ingredient sold,
    pricePerUnit: price of purchase (per base unit)
}]
parent = the merchant that it belongs to
*/
class Order{
    constructor(id, name, date, taxes, fees, ingredients, parent){
        if(!this.isSanitaryString(name)){
            return false;
        }
        if(taxes < 0){
            return false;
        }

        this._id = id;
        this._name = name;
        this._date = new Date(date);
        this._taxes = taxes;
        this._fees = fees;
        this._ingredients = [];
        this._parent = parent;

        if(date > new Date()){
            return false;
        }

        for(let i = 0; i < ingredients.length; i++){
            for(let j = 0; j < merchant.ingredients.length; j++){
                if(merchant.ingredients[j].ingredient.id === ingredients[i].ingredient){
                    this._ingredients.push(new OrderIngredient(
                        merchant.ingredients[j].ingredient,
                        ingredients[i].quantity,
                        ingredients[i].pricePerUnit
                    ));
                    break;
                }
            }
            
        }

        this._parent.modules.ingredients.isPopulated = false;
    }

    get id(){
        return this._id;
    }

    get name(){
        return this._name;
    }

    get date(){
        return this._date;
    }

    get taxes(){
        return this._taxes / 100;
    }

    get fees(){
        return this._fees / 100;
    }

    get parent(){
        return this._parent;
    }

    get ingredients(){
        return this._ingredients;
    }

    getIngredientCost(){
        let sum = 0;
        for(let i = 0; i < this._ingredients.length; i++){
            sum += this._ingredients[i].cost();
        }
        return sum;
    }

    getTotalCost(){
        return (this.getIngredientCost() + this.taxes + this.fees);
    }

    isSanitaryString(str){
        let disallowed = ["\\", "<", ">", "$", "{", "}", "(", ")"];

        for(let i = 0; i < disallowed.length; i++){
            if(str.includes(disallowed[i])){
                return false;
            }
        }

        return true;
    }
}

module.exports = Order;