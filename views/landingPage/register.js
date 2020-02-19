let registerObj = {
    display: function(){
        controller.clearScreen();
        controller.registerStrand.style.display = "flex";
    },

    cancel: function(){
        event.preventDefault();

        publicObj.display();
    },

    submitNone: function(){
        event.preventDefault();

        let name = document.querySelector("#regName").value;
        let email = document.querySelector("#regEmail").value;
        let pass = document.querySelector("#regPass").value;
        let confirmPass = document.querySelector("#regConfirmPass").value;

        let data = {
            name: name,
            email: email,
            password: pass,
            confirmPassword: confirmPass
        }

        if(validator.merchant.password(pass, confirmPass) && validator.isSanitary(name)){
            document.querySelector("#regsiterStrand form").submit();
        }

        // if(validator.merchant.password(pass, confirmPass) && validator.isSanitary(name)){
        //     axios.post("/merchant/create/none", data)
        //         .catch((err)=>{
        //             banner.createError("Error: Unable to create account at the moment");
        //         });
        // }
    }
}