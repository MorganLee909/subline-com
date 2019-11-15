let validator = {
    ingredient: {
        name: function(ingName, createBanner = true){
            if(ingName.length < 2){
                if(createBanner){
                    banner.createError("Ingredient name must contain at least 2 characters");
                }
                return false;
            }

            return true;
        },

        category: function(ingCategory, createBanner = true){
            if(ingCategory.length < 3){
                if(createBanner){
                    banner.createError("Category name must contain at least 3 characters");
                }
                return false;
            }

            return true;
        },

        quantity: function(num, createBanner = true){
            if(num < 0){
                if(createBanner){
                    banner.createError("Quantity cannot be a negative number");
                }
                return false;
            }

            return true;
        },

        unit: (ingUnit)=>{
            return true;
        },

        //Check all parts of ingredient, return true if all pass
        //Quantity passed seperately and optional
        all: function(ingObject, quantity = 0, createBanner = true){
            let nameCheck = this.name(ingObject.name, createBanner);
            let categoryCheck = this.category(ingObject.category, createBanner);
            let unitCheck = this.unit(ingObject.unitType, createBanner);
            let quantityCheck = this.quantity(Number(quantity), createBanner);

            if(!nameCheck || !categoryCheck || !quantityCheck || !unitCheck){
                return false;
            }

            return true;
        }
    },

    merchant: {
        name: function(name, createBanner = true){
            if(name.length < 3){
                if(createBanner){
                    banner.createError("Your name is too short");
                }
                return false;
            }

            return true;
        },

        password: function(pass, confirmPass, createBanner = true){
            if(pass !== confirmPass){
                if(createBanner){
                    banner.createError("Your passwords do not match");
                }
                return false;
            }

            if(pass.length < 15){
                if(createBanner){
                    banner.createError("Your password must contain at least 15 characters");
                }
                return false;
            }

            return true;
        }
    }
}