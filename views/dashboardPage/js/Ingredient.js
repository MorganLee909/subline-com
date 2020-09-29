class Ingredient{
    constructor(id, name, category, unitType, unit, parent, specialUnit = undefined, unitSize = undefined){
        if(!controller.sanitaryString(name)){
            banner.createError("NAME CONTAINS ILLEGAL CHARCTERS");
            return false;
        }
        if(!controller.sanitaryString(category)){
            banner.createError("CATEGORY CONTAINS ILLEGAL CHARACTERS");
            return false;
        }
        
        this._id = id;
        this._name = name;
        this._category = category;
        this._unitType = unitType;
        this._unit = unit;
        this._parent = parent;
        if(specialUnit){
            this._specialUnit = specialUnit;
            this._unitSize = unitSize;
        }
    }

    get id(){
        return this._id;
    }

    get name(){
        return this._name;
    }

    set name(name){
        if(!controller.sanitaryString(name)){
            return false;
        }

        this._name = name;
    }

    get category(){
        return this._category;
    }

    set category(category){
        if(!controller.sanitaryString(category)){
            return false;
        }

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
        return this._unitSize;
    }

    set unitSize(unitSize){
        if(unitSize < 0){
            return false;
        }

        this._unitSize = unitSize;
    }
}

module.exports = Ingredient;