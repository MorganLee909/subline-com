basicInfoObj = {
    display: function(){
        controller.clearScreen();
        controller.basicInfoStrand.style.display = "flex";
    },

    submit: function(){
        event.preventDefault();

        let name = document.querySelector("#regName").value;
        let email = document.querySelector("#regEmail").value;
        let password = document.querySelector("#regPass").value;
        let confirmPassword = document.querySelector("#regConfirmPass").value;

        let nameCheck = validator.merchant.name(name);
        let passCheck = validator.merchant.password(password, confirmPassword);

        if(nameCheck && passCheck){
            controller.data.name = name;
            controller.data.email = email;
            controller.data.password = password;

            addIngredientsObj.display();
        }
    }
}