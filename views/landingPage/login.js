let loginObj = {
    display: function(username){
        controller.clearScreen();
        controller.loginStrand.style.display = "flex";

        document.getElementById("goToRegister").addEventListener("click", ()=>{registerObj.display()});
    },

    cancel: function(){
        event.preventDefault();
        
        publicObj.display();
    },
}