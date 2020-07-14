window.transactionsStrandObj = {
    isPopulated: false, 

    display: function(){
        if(!this.isPopulated){
            let transactionsList = document.getElementById("transactionsList");
            let template = document.getElementById("transaction").content.children[0];

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
    }
}