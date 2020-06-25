window.transactionsStrandObj = {
    isPopulated: false, 

    display: function(){
        console.time("populate transactions");
        if(!this.isPopulated){
            let now = new Date();
            let firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            let transactionsList = document.getElementById("transactionsList");
            let template = document.getElementById("transaction").content.children[0];

            for(let i = merchant.transactions.length - 1; i > merchant.transactions.length - 101 ; i--){
                let transaction = template.cloneNode(true);
                transactionsList.appendChild(transaction);

                transaction.children[0].innerText = `${merchant.transactions[i].date.toLocaleDateString()} ${merchant.transactions[i].date.toLocaleTimeString()}`;
                transaction.children[1].innerText = `${merchant.transactions[i].recipes.length} recipes sold`;
            }

            this.isPopulated = true;
        }
        console.timeEnd("populate transactions");
    }
}