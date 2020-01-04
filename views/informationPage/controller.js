let controller = {
    legalStrand = document.querySelector("#legalStrand"),

    clearScreen: function(){
        this.legalStrand.style.display = "none";
    },

    onStart: function(){
        legalObj.display();
    }
}

controller.onStart();