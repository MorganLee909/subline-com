window.ordersStrandObj = {
    isPopulated: false,

    display: function(){
        if(!this.isPopulated){
            fetch("/orders", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
            })
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        let tbody = document.querySelector("#orderList tbody");
                        let template = document.querySelector("#order").content.children[0];

                        for(let i = 0; i < response.length; i++){
                            let row = template.cloneNode(true);
                            let totalCost = 0;
                            
                            for(let j = 0; j < response[i].ingredients; j++){
                                totalCost += response[i].ingredients[j].quantity * response[i].ingredients[j].price;
                            }

                            row.children[0].innerText = response[i]._id;
                            row.children[1].innerText = response[i].ingredients.length;
                            row.children[2].innerText = response[i].date;
                            row.children[3].innerText = totalCost;
                        }
                    }
                })
                .catch((err)=>{
                    banner.createError("Unable to retrieve your orders at the moment");
                });
        }
    }
}