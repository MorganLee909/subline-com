const Merchant = require("../classes/Merchant");

let account = {
    display: function(){
        document.getElementById("accountStrandTitle").innerText = merchant.name;
        document.getElementById("accountEmail").value = merchant.email;

        document.getElementById("accountUpdate").onclick = ()=>{this.updateData()};
        document.getElementById("deleteMerchant").onclick = ()=>{controller.openModal("confirmDeleteMerchant")};

        //Display alternate locations
        document.getElementById("settingsAddMerchant").onclick = ()=>{controller.openModal("newMerchant")};
        let container = document.getElementById("settingsMerchants");
        let template = document.getElementById("locationDiv").content.children[0];

        while(container.children.length > 0){
            container.removeChild(container.firstChild);
        }

        for(let i = 0; i < merchant.owner.merchants.length; i++){
            let div = template.cloneNode(true);
            div.children[0].innerText = merchant.owner.merchants[i].name;
            div.children[1].onclick = ()=>{this.switchMerchant(merchant.owner.merchants[i]._id)};
            container.appendChild(div);
        }

        //Handle the password changey stuffs
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
                    controller.createBanner("DATA UPDATED", "success");
                    if(response.email !== merchant.email) controller.createBanner("YOU MUST VALIDATE YOUR NEW EMAIL ADDRESS BEFORE YOU CAN LOG IN AGAIN", "alert");

                    merchant.email = response.email;
                    merchant.owner.email = response.email;
                    document.getElementById("accountEmail").value = merchant.owner.email;
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
        let data = {
            current: document.getElementById("accountCurrentPassword").value,
            new: document.getElementById("accountNewPassword").value,
            confirm: document.getElementById("accountConfirmPassword").value
        }
        
        if(data.new !== data.confirm){
            return controller.createBanner("PASSWORDS DO NOT MATCH");
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/merchant/password", {
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
                    window.location.href = response.redirect;
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    switchMerchant: function(id){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "none";

        fetch(`/merchant/${id}`)
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    window.merchant = new Merchant(
                        response[1].name,
                        response[0].email,
                        response[1].pos,
                        response[1].inventory,
                        response[1].recipes,
                        response[2],
                        response[0]
                    );

                    state.updateMerchant();
                    controller.openStrand("home");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    deleteMerchant: function(){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/merchant", {method: "delete"})
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    window.merchant = new Merchant(
                        response[1].name,
                        response[0].email,
                        response[1].pos,
                        response[1].inventory,
                        response[1].recipes,
                        response[2],
                        response[0]
                    );
                    state.updateMerchant();

                    controller.closeModal();
                    controller.openStrand("home");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = account;