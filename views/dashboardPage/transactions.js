window.transactionsStrandObj = {
    isPopulated: false, 

    display: function(){
        if(!this.isPopulated){
            let now = new Date();
            let firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            let dates = merchant.transactionIndices(firstOfMonth);
            let transactionsList = document.getElementById("transactionsList");
            let template = document.getElementById("transaction").content.children[0];

            for(let i = dates[0]; i < dates[1]; i++){
                let transaction = template.cloneNode(true);
                transactionsList.appendChild(transaction);

                transaction.children[0].innerText = `${merchant.transactions[i].date.toLocaleDateString()} ${merchant.transactions[i].date.toLocaleTimeString()}`;
                transaction.children[1].innerText = `${merchant.transactions[i].recipes.length} recipes sold`;
            }
        }
    }
}