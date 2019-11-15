let controller = {
    publicStrand: document.querySelector("#publicStrand"),
    loginStrand: document.querySelector("#loginStrand"),
    posChoiceStrand: document.querySelector("#posChoiceStrand"),

    clearScreen: function(){
        this.publicStrand.style.display = "none";
        this.loginStrand.style.display = "none";
        this.posChoiceStrand.style.display = "none";
    }
}

publicObj.display();