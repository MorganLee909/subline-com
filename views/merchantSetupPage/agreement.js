let agreementObj = {
    display: function(){
        controller.clearScreen();
        controller.agreementStrand.style.display = "flex";
    },

    agree: function(){
        let checkbox = document.querySelector("#agreementStrand input");
        let button = document.querySelector("#agreementStrand button");

        if(checkbox.checked){
            button.disabled = false;
        }else{
            button.disabled = true;
        }
    }
}