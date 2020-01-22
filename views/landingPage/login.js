let loginObj = {
    display: function(){
        controller.clearScreen();
        controller.loginStrand.style.display = "flex";
    },

    cancel: function(){
        event.preventDefault();
        
        publicObj.display();
    }
}