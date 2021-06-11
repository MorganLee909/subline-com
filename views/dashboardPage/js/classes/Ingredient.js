class Ingredient{
    constructor(id, name, category, unitType, unit, parent, unitSize = undefined){
        this._id = id;
        this._name = name;
        this._category = category;
        this._unitType = unitType;
        this._unit = unit;
        this._parent = parent;
        this._unitSize = unitSize;
        this._subIngredients = [];
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

    get unitType(){
        return this._unitType;
    }

    set unitType(unitType){
        this._unitType = unitType;
    }

    get unit(){
        return this._unit;
    }

    set unit(unit){
        this._unit = unit;
    }

    get specialUnit(){
        return this._specialUnit;
    }

    get unitSize(){
        switch(this._unit){
            case "g":return this._unitSize; 
            case "kg": return this._unitSize / 1000;
            case "oz": return this._unitSize / 28.3495;
            case "lb": return this._unitSize / 453.5924;
            case "ml": return this._unitSize * 1000;
            case "l": return this._unitSize;
            case "tsp": return this._unitSize * 202.8842;
            case "tbsp": return this._unitSize * 67.6278;
            case "ozfl": return this._unitSize * 33.8141;
            case "cup": return this._unitSize * 4.1667;
            case "pt": return this._unitSize * 2.1134;
            case "qt": return this._unitSize * 1.0567;
            case "gal": return this._unitSize / 3.7854;
            case "mm": return this._unitSize * 1000;
            case "cm": return this._unitSize * 100;
            case "m": return this._unitSize;
            case "in": return this._unitSize * 39.3701;
            case "ft": return this._unitSize * 3.2808;
            default: return this._unitSize;
        }
    }

    set unitSize(unitSize){
        if(unitSize < 0){
            return false;
        }

        this._unitSize = unitSize;
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

    getBaseUnitSize(){
        return this._unitSize;
    }

    getNameAndUnit(){
        return `${this._name} (${this._unit.toUpperCase()})`;
    }

    /*
    Show matching unit types for this ingredient
    return = [String]
    */
    getPotentialUnits(){
        let mass = ["g", "kg", "oz", "lb"];
        let volume = ["ml", "l", "tsp", "tbsp", "ozfl", "cup", "pt", "qt", "gal"];
        let length = ["mm", "cm", "m", "in", "ft"];

        if(mass.includes(this._unit)) return mass;
        if(volume.includes(this._unit)) return volume;
        if(length.includes(this._unit)) return length;
        if(this._unit === "bottle") return volume;
        return [];
    }

    getUnitCost(){
        let totalCost = 0;
        let quantity = 0;

        for(let i = 0; i < this._parent.orders.length; i++){
            for(let j = 0; j < this._parent.orders[i].ingredients.length; j++){
                let ingredient = this._parent.orders[i].ingredients[j];

                if(ingredient.ingredient === this){
                    totalCost += ingredient.quantity * ingredient.pricePerUnit;
                    quantity += ingredient.quantity;
                    break;
                }
            }
        }

        return (quantity === 0) ? 0 : totalCost / quantity;
    }
}

module.exports = Ingredient;