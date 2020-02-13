let publicObj = {
    display: function(){
        controller.clearScreen();
        controller.publicStrand.style.display = "flex";

        if(isLoggedIn){
            loginObj.display();
        }
    }
}