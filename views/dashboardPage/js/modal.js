const Merchant = require("./classes/Merchant.js");

let modal = {
    feedback: function(){
        let form = document.getElementById("modalFeedback");
        form.style.display = "flex";
        form.onsubmit = ()=>{this.submitFeedback()};
    },

    submitFeedback: function(){
        event.preventDefault();

        let data = {
            title: document.getElementById("feedbackTitle").value,
            content: document.getElementById("feedbackContent").value,
            date: new Date()
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/feedback", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }
                controller.createBanner("THANK YOU FOR YOUR INPUT", "success");
                controller.closeModal();
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error")
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    newMerchant: function(){
        let form = document.getElementById("modalNewMerchant");
        form.style.display = "flex";
        form.onsubmit = ()=>{this.submitNewMerchantNone()};
        document.getElementById("newMerchantSquareButton").onclick = ()=>{this.submitNewMerchantSquare()};
    },

    submitNewMerchantNone(){
        event.preventDefault();

        let data = {
            name: document.getElementById("addMerchantName").value,
        };

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/merchant/add/none", {
            method: "post",
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
                    let newMerchant = new Merchant(
                        response[1].name,
                        response[0].email,
                        response[1].pos,
                        response[1].inventory,
                        response[1].recipes,
                        [],
                        response[0]
                    );

                    window.merchant = newMerchant;

                    state.updateMerchant();
                    controller.openStrand("home");
                    controller.closeModal();
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    submitNewMerchantSquare: function(){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/square/locations")
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    controller.closeModal();
                    controller.openModal("squareLocations", response);
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    squareLocations: function(locations){
        document.getElementById("modalSquareLocations").style.display = "flex";
        document.getElementById("squareLocationsCancel").onclick = ()=>{controller.closeModal()};
        let container = document.getElementById("squareLocationsButtons");

        while(container.children.length > 0){
            container.removeChild(container.firstChild);
        }

        for(let i = 0; i < locations.length; i++){
            let button = document.createElement("button");
            button.innerText = locations[i].name;
            button.classList.add("button");
            button.onclick = ()=>{this.createSquareLocation(locations[i].id)};
            container.appendChild(button);
        }
    },

    createSquareLocation: function(id){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/square/add/${id}`)
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
                        [],
                        response[0]
                    );

                    state.updateMerchant();
                    controller.closeModal();
                    controller.openStrand("home");
                    controller.createBanner(`NEW MERCHANT, "${response[1].name}", CREATED`, "success");
                }
            })
            .catch((err)=>{
                console.log(err);
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
};

module.exports = modal;