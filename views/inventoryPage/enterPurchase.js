window.enterPurchaseObj = {
    isPopulated: false,

    display: function(){
        clearScreen();
        document.querySelector("#enterPurchaseAction").style.display = "flex";

        if(!this.isPopulated){
            this.populateTable();
        }
    },

    populateTable: function(){
        let tbody = document.querySelector("#enterPurchaseAction tbody");

        while(tbody.children.length > 0){
            tbody.removeChild(tbody.firstChild);
        }

        for(let item of merchant.inventory){
            let row = document.createElement("tr");
            row._id = item.ingredient._id;
            tbody.appendChild(row);

            let nameTd = document.createElement("td");
            nameTd.innerText = item.ingredient.name;
            row.appendChild(nameTd);

            let quantityTd = document.createElement("td");
            row.appendChild(quantityTd);

            let quantityInput = document.createElement("input");
            quantityInput.type = "number";
            quantityInput.step = "1";
            quantityInput.value = 0;
            quantityTd.appendChild(quantityInput);
        }
    },

    submit: function(){
        let tbody = document.querySelector("#enterPurchaseAction tbody");

        let purchases = [];

        for(let row of tbody.children){
            let quantity = row.children[1].children[0].value;
            if(validator.ingredient.quantity(quantity)){
                if(quantity > 0){
                    let purchase = {
                        ingredient: row._id,
                        quantity: row.children[1].children[0].value
                    }

                    purchases.push(purchase);
                }else if(quantity < 0){
                    banner.createError("Cannot contain negative numbers");
                    return;
                }
            }else{
                return;
            }
        }

        axios.post("/purchases/create", purchases)
            .then((response)=>{
                if(typeof(response.data) === "string"){
                    banner.createError(response.data);
                }else{
                    for(let purchase of purchases){
                        let merchantIngredient = merchant.inventory.find(i => i.ingredient._id === purchase.ingredient);
                        merchantIngredient.quantity = Number(merchantIngredient.quantity) + Number(purchase.quantity);
                    }

                    inventoryObj.isPopulated = false;
                    this.isPopulated = false;
                    inventoryObj.display();
                }
            })
            .catch((err)=>{
                console.log(err);
                banner.createError("Something went wrong and changes could not be made");
            });
    }
}