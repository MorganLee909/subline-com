class Ingredient{
    constructor(id, name, category, unitType, unit, parent, unitSize = undefined, ingredients){
        this._id = id;
        this._name = name;
        this._category = category;
        this._unitType = unitType;
        this._unit = unit;
        this._parent = parent;
        this._unitSize = unitSize;
        this._ingredients = [];

        for(let i = 0; i < ingredients.length; i++){
            ingredients.push(this._parent.getIngredient(ingredinets[i]));
        }
    }

    get id(){
        return this._id;
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

    get unit(){
        return this._unit;
    }

    set unit(unit){
        this._unit = unit;
    }

    get parent(){
        return this._parent;
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

    getBaseUnitSize(){
        return this._unitSize;
    }

    getNameAndUnit(){
        return `${this._name} (${this._unit.toUpperCase()})`;
    }

    getPotentialUnits(){
        let mass = ["g", "kg", "oz", "lb"];
        let volume = ["ml", "l", "tsp", "tbsp", "ozfl", "cup", "pt", "qt", "gal"];
        let length = ["mm", "cm", "m", "in", "ft"];

        if(mass.includes(this._unit)){
            return mass;
        }
        if(volume.includes(this._unit)){
            return volume;
        }
        if(length.includes(this._unit)){
            return length;
        }
        if(this._unit === "bottle"){
            return volume;
        }
        return [];

    }
}

module.exports = Ingredient;