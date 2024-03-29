const Merchant = require("../classes/Merchant");

let account = {
    display: function(){
        document.getElementById("accountStrandTitle").innerText = merchant.owner.name;
        document.getElementById("accountEmail").value = merchant.owner.email;
        document.getElementById("accountOwnerName").value = merchant.owner.name;
        document.getElementById("accountAddress").value = merchant.address;

        document.getElementById("accountUpdate").onclick = ()=>{this.updateData()};
        document.getElementById("deleteMerchant").onclick = ()=>{controller.openModal("confirmDeleteMerchant")};

        //Display alternate locations
        document.getElementById("settingsAddMerchant").onclick = ()=>{controller.openModal("newMerchant")};
        let container = document.getElementById("settingsMerchants");

        while(container.children.length > 0){
            container.removeChild(container.firstChild);
        }

        for(let i = 0; i < merchant.owner.merchants.length; i++){
            let button = document.createElement("button");
            button.innerText = merchant.owner.merchants[i].name;
            button.classList.add("button");
            button.onclick = ()=>{this.switchMerchant(merchant.owner.merchants[i]._id)};
            container.appendChild(button);
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
        document.getElementById("newMerchantSquareButton").onclick = ()=>{this.getSquareLocations()};
    },

    updateData: function(){
        let data = {
            email: document.getElementById("accountEmail").value,
            name: document.getElementById("accountOwnerName").value,
            address: document.getElementById("accountAddress").value
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
                    if(merchant.owner.email !== response.email){
                        controller.createBanner("YOU MUST VALIDATE YOUR NEW EMAIL ADDRESS BEFORE YOU CAN LOG IN AGAIN", "alert");
                        merchant.owner.email = response.email;
                    }

                    merchant.owner.name = response.name;
                    merchant.address = response.address;

                    document.getElementById("accountOwnerName").value = merchant.owner.name;
                    document.getElementById("accountStrandTitle").innerText = merchant.owner.name;
                    document.getElementById("accountEmail").value = merchant.owner.email;
                    document.getElementById("accountAddress").value = merchant.address;
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
        };
        
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
                    window.location.replace(response.redirect);
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
        loader.style.display = "flex";

        fetch(`/merchant/${id}`)
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    window.merchant = new Merchant(
                        response[1].name,
                        response[1].pos,
                        response[1].inventory,
                        response[1].recipes,
                        response[2],
                        (response[1].address === undefined) ? "" : response[1].address.full,
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
                        response[1].pos,
                        response[1].inventory,
                        response[1].recipes,
                        response[2],
                        (response[1].address === undefined) ? "" : response[1].address.full,
                        response[0]
                    );
                    state.updateMerchant();

                    controller.closeModal();
                    controller.openStrand("home");
                    controller.createBanner("MERCHANT DELETED", "success");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    getSquareLocations: function(){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/square/locations")
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    controller.openModal("squareLocations", response);
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