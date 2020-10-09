class OrderIngredient{
    constructor(ingredient, quantity){
        if(quantity < 0){
            return false;
        }
        this._ingredient = ingredient;
        this._quantity = quantity;
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
            case "kg": return this._quantity * 1000;
            case "oz": return this._quantity * 28.3495;
            case "lb": return this._quantity * 453.5924;
            case "ml": return this._quantity / 1000;
            case "l": return this._quantity;
            case "tsp": return this._quantity / 202.8842;
            case "tbsp": return this._quantity / 67.6278;
            case "ozfl": return this._quantity / 33.8141;
            case "cup": return this._quantity / 4.1667;
            case "pt": return this._quantity / 2.1134;
            case "qt": return this._quantity / 1.0567;
            case "gal": return this._quantity * 3.7854;
            case "mm": return this._quantity / 1000;
            case "cm": return this._quantity / 100;
            case "m": return this._quantity;
            case "in": return this._quantity / 39.3701;
            case "ft": return this._quantity / 3.2808;
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
}

class Order{
    constructor(id, name, date, taxes, fees, ingredients, parent){
        if(!this.isSanitaryString(name)){
            banner.createError("NAME CONTAINS ILLEGAL CHARACTERS");
            return false;
        }
        if(taxes < 0){
            banner.createError("TAXES CANNOT BE A NEGATIVE NUMBER");
        }

        this._id = id;
        this._name = name;
        this._date = new Date(date);
        this._taxes = taxes;
        this._fees = fees;
        this._ingredients = [];
        this._parent = parent;

        if(date > new Date()){
            banner.createError("CANNOT SET A DATE IN THE FUTURE");
            return false;
        }

        for(let i = 0; i < ingredients.length; i++){
            const orderIngredient = new OrderIngredient(
                ingredients[i].ingredient,
                ingredients[i].quantity
            )

            this._ingredients.push(orderIngredient);
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
        return this._taxes;
    }

    get fees(){
        return this._fees;
    }

    get parent(){
        return this._parent;
    }

    get ingredients(){
        return this._ingredients;
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