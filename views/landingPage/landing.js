let landingPage = {
    clearScreen: function(){
        document.querySelector("#main").style.display = "none";
        document.querySelector("#login").style.display = "none";
        document.querySelector("#pos").style.display = "none";
        document.querySelector("#register").style.display = "none";

    },

    choosePos: function(){
        this.clearScreen();
        document.querySelector("#pos").style.display = "flex";
    }
}