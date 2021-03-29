const merchant = require("../../../models/merchant.js");
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
        let data = {
            name: document.getElementById("addMerchantName").value
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/merchant/add/square", {
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
                    console.log(response);
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