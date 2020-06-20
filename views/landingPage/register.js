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

        if(!checkbox.checked){
            banner.createError("Please agree to the Privacy Policy and Terms and Conditions to continue");
            return;
        }

        let pass = document.getElementById("regPass").value;
        let confirmPass = document.getElementById("regConfirmPass").value;
        if(pass !== confirmPass){
            banner.createError("Your passwords do not match");
            return;
        }

        if(checkbox.checked){
            if(validator.isSanitary(document.querySelector("#regName").value)){
                document.getElementById("loaderContainer").style.display = "flex";
                form.action = "merchant/create/none";
                form.method = "post";
                form.submit();
            }
        }else{
            banner.createError("Please agree to the Privacy Policy and Terms and Conditions to continue");
        }
    }
}