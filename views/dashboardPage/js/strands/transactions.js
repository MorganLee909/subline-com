let transactions = {
    transactions: [],

    display: function(){
        document.getElementById("filterTransactionsButton").onclick = ()=>{controller.openSidebar("transactionFilter")};
        document.getElementById("newTransactionButton").onclick = ()=>{controller.openSidebar("newTransaction")};
        if(this.transactions.length === 0){
            let from = new Date();
            from.setDate(from.getDate() - 7);
            from.setHours(0, 0, 0, 0);

            this.transactions = merchant.getTransactions(from, new Date());
        }

        this.populateTransactions();

        this.isPopulated = true;
    },

    populateTransactions: function(){
        let transactionsList = document.getElementById("transactionsList");
        let template = document.getElementById("transaction").content.children[0];

        while(transactionsList.children.length > 0){
            transactionsList.removeChild(transactionsList.firstChild);
        }

        let i = 0;
        while(i < this.transactions.length && i < 100){
            let transactionDiv = template.cloneNode(true);
            let transaction = this.transactions[i];

            transactionDiv.onclick = ()=>{
                controller.openSidebar("transactionDetails", transaction);
                transactionDiv.classList.add("active");
            }
            transactionsList.appendChild(transactionDiv);

            let totalRecipes = 0;
            let totalPrice = 0;

            for(let j = 0; j < transaction.recipes.length; j++){
                totalRecipes += transaction.recipes[j].quantity;
                totalPrice += transaction.recipes[j].recipe.price * transaction.recipes[j].quantity;
            }

            transactionDiv.children[0].innerText = transaction.date.toLocaleDateString();
            transactionDiv.children[1].innerText = `${totalRecipes} recipes sold`;
            transactionDiv.children[2].innerText = `$${totalPrice.toFixed(2)}`;

            i++;
        }
    }
}

module.exports = transactions;