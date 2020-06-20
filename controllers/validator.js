module.exports = {
    ingredient: function(ingredient){
        if(!this.isSanitary([ingredient.name, ingredient.category, ingredient.unit])){
            return false;
        }

        return true;
    },

    quantity: function(num){
        if(isNaN(num) || num === ""){
            return false;
        }

        if(num < 0){
            return false;
        }

        return true;
    },

    isSanitary: function(strings){
        let disallowed = ["\\", "<", ">", "$", "{", "}", "(", ")"];

        for(let i = 0; i < strings.length; i++){
            for(let j = 0; j < disallowed.length; j++){
                if(strings[i].includes(disallowed[j])){
                    return false;
                }
            }
        }

        return true;
    }
}