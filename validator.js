module.exports = {
    isSanitary: function(strings){
        let disallowed = ["\\", "<", ">", "$", "{", "}", "."];

        for(let i = 0; i < strings.length; i++){
            for(let j = 0; j < disallowed.length; j++){
                if(strings[i].includes(disallowed[j])){
                    return false;
                }
            }
        }

        return true;
    },

    emailValid: function(value){
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
    }
}