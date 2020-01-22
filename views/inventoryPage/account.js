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

        if(validator.isSanitary(name)){
            axios.post("/merchant/update", data)
                .then((response)=>{
                    if(typeof(response.data) === "string"){
                        banner.createError(response.data);
                    }else{
                        merchant.name = data.name;
                        merchant.email = data.email;

                        document.querySelector("#accountDisplay").style.display = "flex";
                        document.querySelector("#accountEdit").style.display = "none";

                        let labels = document.querySelector("#accountDisplay label");
                        labels[0].children[0].innerText = merchant.name;
                        labels[1].children[0].innerText = merchant.email;
                    }
                })
                .catch((err)=>{
                    banner.createError("Error: Your data could not be updated");
                });
        }
    },

    editPassword: function(){

    },

    updatePassword: function(){

    }
}