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
                }else{
                    controller.createBanner("THANK YOU FOR YOUR INPUT", "success");
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
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    let newMerchant = new Merchant(
                        response[1].name,
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

    squareLocations: function(locations){
        document.getElementById("modalSquareLocations").style.display = "flex";
        document.getElementById("squareLocationsCancel").onclick = ()=>{controller.closeModal()};
        if(locations.length === 0){
            document.getElementById("squareLocationsTitle").innerText = "ALL OF YOUR LOCATIONS HAVE ALREADY BEEN ADDED TO THE SUBLINE";
            return;
        }

        let container = document.getElementById("squareLocationsButtons");

        while(container.children.length > 0){
            container.removeChild(container.firstChild);
        }
        
        for(let i = 0; i < locations.length; i++){
            let button = document.createElement("button");
            button.innerText = locations[i].name;
            button.classList.add("button");
            button.onclick = ()=>{this.addSquareMerchant(locations[i].id)};
            container.appendChild(button);
        }
    },

    addSquareMerchant: function(id){
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
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    editSubIngredients: function(ingredient){
        document.getElementById("modalEditSubIngredients").style.display = "flex";

        let left = document.getElementById("editSubAllIng");
        let right = document.getElementById("editSubCurrentIng");
        let template = document.getElementById("selectedSubIngredient").content.children[0];

        for(let i = 0; i < merchant.ingredients.length; i++){
            let skip = false;
            for(let j = 0; j < ingredient.subIngredients.length; j++){
                if(merchant.ingredients[i].ingredient === ingredient.subIngredients[j].ingredient){
                    let div = template.cloneNode(true);
                    div.children[0].children[0].innerText = merchant.ingredients[i].ingredient.name;
                    right.appendChild(div);
                    skip = true;
                    break;
                }
            }
            if(skip === true) continue;

            let button = document.createElement("button");
            button.innerText = merchant.ingredients[i].ingredient.name;
            button.classList.add("choosable");
            left.appendChild(button);
        }
    }
};

module.exports = modal;