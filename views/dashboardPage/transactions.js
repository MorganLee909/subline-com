window.transactionsStrandObj = {
    isPopulated: false, 

    display: function(){
        if(!this.isPopulated){
            let transactionsList = document.getElementById("transactionsList");
            let template = document.getElementById("transaction").content.children[0];

            while(transactionsList.children.length > 0){
                transactionsList.removeChild(transactionsList.firstChild);
            }

            for(let i = merchant.transactions.length - 1; i > merchant.transactions.length - 101 ; i--){
                let transaction = template.cloneNode(true);
                transaction.onclick = ()=>{transactionDetailsComp.display(merchant.transactions[i])};
                transactionsList.appendChild(transaction);

                let totalRecipes = 0;
                let totalPrice = 0;

                for(let j = 0; j < merchant.transactions[i].recipes.length; j++){
                    totalRecipes += merchant.transactions[i].recipes[j].quantity;
                    totalPrice += merchant.transactions[i].recipes[j].recipe.price * merchant.transactions[i].recipes[j].quantity;
                }

                transaction.children[0].innerText = `${merchant.transactions[i].date.toLocaleDateString()} ${merchant.transactions[i].date.toLocaleTimeString()}`;
                transaction.children[1].innerText = `${totalRecipes} recipes sold`;
                transaction.children[2].innerText = `$${(totalPrice / 100).toFixed(2)}`;
            }

            this.isPopulated = true;
        }
    }
}