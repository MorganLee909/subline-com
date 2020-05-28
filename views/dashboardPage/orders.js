window.ordersStrandObj = {
    isPopulated: false,

    display: async function(){
        if(!this.isPopulated){
            window.orders = [];

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
                        let listDiv = document.querySelector("#orderList");
                        let template = document.querySelector("#order").content.children[0];

                        for(let i = 0; i < response.length; i++){
                            let row = template.cloneNode(true);
                            let totalCost = 0;
                            
                            for(let j = 0; j < response[i].ingredients.length; j++){
                                totalCost += response[i].ingredients[j].quantity * response[i].ingredients[j].price;
                            }

                            row.children[0].innerText = response[i].orderId;
                            row.children[1].innerText = `${response[i].ingredients.length} items`;
                            row.children[2].innerText = new Date(response[i].date).toLocaleDateString("en-US");
                            row.children[3].innerText = (totalCost / 100).toFixed(2);
                            row._date = row.children[2].innerText;
                            row._id = response[i]._id;

                            window.orders.push(row);
                            listDiv.appendChild(row);
                        }
                    }
                })
                .catch((err)=>{
                    banner.createError("Unable to retrieve your orders at the moment");
                });

            this.isPopulated = true;
        }
    }
}