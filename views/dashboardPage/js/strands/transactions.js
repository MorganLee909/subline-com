let transactions = {
    transactions: [],

    display: function(){
        document.getElementById("filterTransactionsButton").onclick = ()=>{controller.openSidebar("transactionFilter")};
        document.getElementById("newTransactionButton").onclick = ()=>{controller.openSidebar("newTransaction")};

        this.populateTransactions(this.transactions);

        this.isPopulated = true;
    },

    populateTransactions: function(transactions){
        let transactionsList = document.getElementById("transactionsList");
        let template = document.getElementById("transaction").content.children[0];

        while(transactionsList.children.length > 0){
            transactionsList.removeChild(transactionsList.firstChild);
        }

        let i = 0;
        while(i < transactions.length && i < 100){
            let transactionDiv = template.cloneNode(true);
            let transaction = transactions[i];

            transactionDiv.onclick = ()=>{
                controller.openSidebar("transactionDetails", transaction);
                transactionDiv.classList.add("active");
            }
            transactionsList.appendChild(transactionDiv);

            let totalRecipes = 0;
            let totalPrice = 0;

            for(let j = 0; j < transactions[i].recipes.length; j++){
                totalRecipes += transactions[i].recipes[j].quantity;
                totalPrice += transactions[i].recipes[j].recipe.price * transactions[i].recipes[j].quantity;
            }

            transactionDiv.children[0].innerText = transactions[i].date.toLocaleDateString();
            transactionDiv.children[1].innerText = `${totalRecipes} recipes sold`;
            transactionDiv.children[2].innerText = `$${totalPrice.toFixed(2)}`;

            i++;
        }
    }
}

module.exports = transactions;