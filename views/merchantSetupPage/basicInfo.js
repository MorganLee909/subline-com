basicInfoObj = {
    display: function(){
        controller.clearScreen();
        controller.basicInfoStrand.style.display = "flex";

        if(!recipes){
            document.querySelector("#nameLabel").style.display = "block";
        }
    },

    submit: function(){
        event.preventDefault();

        let name = document.querySelector("#regName").value;
        let email = document.querySelector("#regEmail").value;
        let password = document.querySelector("#regPass").value;
        let confirmPassword = document.querySelector("#regConfirmPass").value;

        if(validator.merchant.password(password, confirmPassword)){
            controller.data.name = name;
            controller.data.email = email;
            controller.data.password = password;

            addIngredientsObj.display();
        }
    }
}