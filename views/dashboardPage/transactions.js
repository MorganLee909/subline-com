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

                transaction.children[0].innerText = `${merchant.transactions[i].date.toLocaleDateString()} ${merchant.transactions[i].date.toLocaleTimeString()}`;
                transaction.children[1].innerText = `${merchant.transactions[i].recipes.length} recipes sold`;
            }

            this.isPopulated = true;
        }
    }
}