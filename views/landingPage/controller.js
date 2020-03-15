let controller = {
    publicStrand: document.querySelector("#publicStrand"),
    loginStrand: document.querySelector("#loginStrand"),
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
        this.registerStrand.style.display = "none";
    }
}

controller.onStart();