let controller = {
    publicStrand: document.querySelector("#publicStrand"),
    loginStrand: document.querySelector("#loginStrand"),

    onStart: function(){
        if(error){
            banner.createError(error);
        }
        
        publicObj.display();
    },

    clearScreen: function(){
        this.publicStrand.style.display = "none";
        this.loginStrand.style.display = "none";
    }
}

controller.onStart();