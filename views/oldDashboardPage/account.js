window.accountObj = {
    display: function(){
        clearScreen();
        document.querySelector("#accountStrand").style.display = "flex";
    },

    editAccount: function(){
        event.preventDefault();

        document.querySelector("#accountDisplay").style.display = "none";
        document.querySelector("#accountEdit").style.display = "flex";
    },

    updateAccount: function(){
        event.preventDefault();

        let data = {
            name: document.querySelector("#accountName").value,
            email: document.querySelector("#accountEmail").value
        }

        if(validator.isSanitary(data.name) && validator.isSanitary(data.email)){
            axios.post("/merchant/update", data)
                .then((response)=>{
                    if(typeof(response.data) === "string"){
                        banner.createError(response.data);
                    }else{
                        document.querySelector("#title").innerText = data.name;

                        merchant.name = data.name;
                        merchant.email = data.email;

                        document.querySelector("#accountDisplay").style.display = "flex";
                        document.querySelector("#accountEdit").style.display = "none";

                        let labels = document.querySelectorAll("#accountDisplay label");
                        labels[0].children[0].innerText = merchant.name;
                        labels[1].children[0].innerText = merchant.email;
                    }
                })
                .catch((err)=>{
                    banner.createError("Error: Your data could not be updated");
                });
        }
    },

    editAccountCancel: function(){
        event.preventDefault();

        document.querySelector("#accountDisplay").style.display = "flex";
        document.querySelector("#accountEdit").style.display = "none";
    },

    editPassword: function(){
        document.querySelector("#passwordEdit").style.display = "flex";
        document.querySelector("#accountStrand > button").style.display = "none";
    },

    updatePassword: function(){
        event.preventDefault();

        let oldPass = document.querySelector("#oldPass").value;
        let newPass = document.querySelector("#newPass").value;
        let confirmNewPass = document.querySelector("#confirmNewPass").value;

        if(validator.merchant.password(newPass, confirmNewPass)){
            axios.post("/merchant/password", {oldPass: oldPass, newPass: newPass})
                .then((response)=>{
                    if(typeof(response.data) === "string"){
                        banner.createError(response.data);
                    }

                    document.querySelector("#oldPass").value = "";
                    document.querySelector("#newPass").value = "";
                    document.querySelector("#confirmNewPass").value = "";

                    document.querySelector("#passwordEdit").style.display = "none";
                    document.querySelector("#accountStrand > button").style.display = "block";
                })
                .catch((err)=>{
                    banner.createError("Error: please refresh page to check for updates");
                });
        }
    },

    editPasswordCancel: function(){
        event.preventDefault();

        document.querySelector("#oldPass").value = "";
        document.querySelector("#newPass").value = "";
        document.querySelector("#confirmNewPass").value = "";

        document.querySelector("#passwordEdit").style.display = "none";
        document.querySelector("#accountStrand > button").style.display = "block";
    }
}