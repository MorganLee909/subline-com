let account = {
    display: function(){
        document.getElementById("accountStrandTitle").innerText = merchant.name;
        document.getElementById("accountEmail").value = merchant.email;

        document.getElementById("accountUpdate").onclick = ()=>{this.updateData()};

        let passButton = document.getElementById("accountShowPassword");
        let passBox = document.getElementById("changePasswordBox");
        passButton.onclick = ()=>{
            passButton.style.display = "none";
            passBox.style.display = "flex";
        };

        document.getElementById("cancelPasswordChange").onclick = ()=>{
            passButton.style.display = "block";
            passBox.style.display = "none";
            document.getElementById("accountCurrentPassword").value = "";
            document.getElementById("accountNewPassword").value = "";
            document.getElementById("accountConfirmPassword").value = "";
        };

        document.getElementById("changePasswordButton").onclick = ()=>{this.updatePassword()};
    },

    updateData: function(){
        let data = {
            email: document.getElementById("accountEmail").value
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/merchant/update", {
            method: "put",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{

                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    updatePassword: function(){
        console.log("updating password");
    }
}

module.exports = account;