let controller = {
    publicStrand: document.querySelector("#publicStrand"),
    loginStrand: document.querySelector("#loginStrand"),
    posChoiceStrand: document.querySelector("#posChoiceStrand"),
    registerStrand: document.querySelector("#registerStrand"),

    onStart: function(){
        if(error){
            banner.createError(error);
        }

        publicObj.display();
    },

    clearScreen: function(){
        this.publicStrand.style.display = "none";
        this.loginStrand.style.display = "none";
        this.posChoiceStrand.style.display = "none";
        this.registerStrand.style.display = "none";
    }
}

controller.onStart();