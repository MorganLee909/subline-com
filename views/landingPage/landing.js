let landingPage = {
    mainComp: document.querySelector("#main"),
    loginComp: document.querySelector("#login"),
    posComp: document.querySelector("#pos"),

    //Remove all displayed components
    clearScreen: function(){
        this.mainComp.style.display = "none";
        this.loginComp.style.display = "none";
        this.posComp.style.display = "none";
    },

    choosePos: function(){
        this.clearScreen();
        this.posComp.style.display = "flex";
    }
}