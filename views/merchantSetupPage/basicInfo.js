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

        axios.post("/email", {email: email})
            .then((response)=>{
                if(typeof(response.data) === "string"){
                    banner.createError(response.data);
                }else if(response.data){
                    if(validator.merchant.password(password, confirmPassword)){
                        controller.data.name = name;
                        controller.data.email = email;
                        controller.data.password = password;
                        controller.data.confirmPassword = confirmPassword;
            
                        addIngredientsObj.display();
                    }
                }else{
                    banner.createError("Email address already in use");
                }
            })
            .catch((err)=>{
                banner.createError("Error: unable to validate email address");
            });
    }
}