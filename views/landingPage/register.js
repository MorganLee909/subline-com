let registerObj = {
    display: function(){
        controller.clearScreen();
        controller.registerStrand.style.display = "flex";

        document.querySelector("#checkAgree").checked = false;
        document.querySelector("#regButton").classList = "buttonDisabled";
    },

    agreement: function(){
        let checkbox = document.querySelector("#checkAgree");
        let button = document.querySelector("#regButton");

        if(checkbox.checked){
            button.classList = "button";
        }else{
            button.classList = "buttonDisabled";
        }
    },

    submit: function(){
        event.preventDefault();

        let form = document.querySelector("#registerStrand form");
        let checkbox = document.querySelector("#checkAgree");

        if(checkbox.checked){
            if(validator.isSanitary(document.querySelector("#restName").value)){
                form.submit();
            }
        }else{
            banner.createError("Please agree to the Privacy Policy and Terms and Conditions to continue");
        }
    }
}