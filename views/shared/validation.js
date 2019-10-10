let validator = {
    ingredient: {
        name: function(ingName){
            if(ingName.length < 2){
                banner.createError("Ingredient name must contain at least 2 characters");
                return false;
            }

            return true;
        },

        category: function(ingCategory){
            if(ingCategory.length < 3){
                banner.createError("Category name must contain at least 3 characters");
                return false;
            }

            return true;
        },

        quantity: function(num){
            if(num < 0){
                banner.createError("Quantity cannot be a negative number");
                return false;
            }

            return true;
        },

        unit: (ingUnit)=>{
            return true;
        },

        all: function(ingObject){
            let nameCheck = this.name(ingObject.ingredient.name);
            let categoryCheck = this.category(ingObject.ingredient.category);
            let quantityCheck = this.quantity(ingObject.quantity);
            let unitCheck = this.unit(ingObject.ingredient.unitType);

            if(!nameCheck || !categoryCheck || !quantityCheck || !unitCheck){
                return false;
            }

            return true;
        }
    }
}