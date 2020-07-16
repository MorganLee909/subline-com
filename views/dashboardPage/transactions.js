window.transactionsStrandObj = {
    isPopulated: false, 

    display: function(){
        if(!this.isPopulated){
            let transactionsList = document.getElementById("transactionsList");
            let template = document.getElementById("transaction").content.children[0];

            let now = new Date();
            let monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            document.getElementById("transFilDate1").valueAsDate = monthAgo;
            document.getElementById("transFilDate2").valueAsDate = now;
            
            let dataList = document.getElementById("transFilRecData");
            for(let i = 0; i < merchant.recipes.length; i++){
                let option = document.createElement("option");
                option.innerText = merchant.recipes[i].name;
                dataList.appendChild(option);
            }

            while(transactionsList.children.length > 0){
                transactionsList.removeChild(transactionsList.firstChild);
            }

            let i = 0
            while(i < merchant.transactions.length && i < 100){
                let transactionDiv = template.cloneNode(true);
                let transaction = merchant.transactions[i];

                transactionDiv.onclick = ()=>{transactionDetailsComp.display(transaction)};
                transactionsList.appendChild(transactionDiv);

                let totalRecipes = 0;
                let totalPrice = 0;

                for(let j = 0; j < merchant.transactions[i].recipes.length; j++){
                    totalRecipes += merchant.transactions[i].recipes[j].quantity;
                    totalPrice += merchant.transactions[i].recipes[j].recipe.price * merchant.transactions[i].recipes[j].quantity;
                }

                transactionDiv.children[0].innerText = `${merchant.transactions[i].date.toLocaleDateString()} ${merchant.transactions[i].date.toLocaleTimeString()}`;
                transactionDiv.children[1].innerText = `${totalRecipes} recipes sold`;
                transactionDiv.children[2].innerText = `$${(totalPrice / 100).toFixed(2)}`;

                i++;
            }

            this.isPopulated = true;
        }
    },

    submitFilter: function(){
        event.preventDefault();

        let data = {
            startDate: document.getElementById("transFilDate1").valueAsDate,
            endDate: document.getElementById("transFilDate2").valueAsDate,
            recipes: document.getElementById("transFilRecipes").value.split(", ")
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    console.log("doing things");
                }
            })
            .catch((err)=>{
                banner.createError("UNABLE TO DISPLAY THE TRANSACTIONS");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}