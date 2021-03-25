const merchant = require("../../../models/merchant");

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
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    console.log(response);
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
};

module.exports = modal;