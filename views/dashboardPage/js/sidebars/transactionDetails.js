let transactionDetails = {
    transaction: {},

    display: function(transaction){
        this.transaction = transaction;

        let recipeList = document.getElementById("transactionRecipes");
        let template = document.getElementById("transactionRecipe").content.children[0];
        let totalRecipes = 0;
        let totalPrice = 0;

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < transaction.recipes.length; i++){
            let recipe = template.cloneNode(true);
            let price = transaction.recipes[i].quantity * transaction.recipes[i].recipe.price;

            recipe.children[0].innerText = transaction.recipes[i].recipe.name;
            recipe.children[1].innerText = `${transaction.recipes[i].quantity} x $${transaction.recipes[i].recipe.price.toFixed(2)}`;
            recipe.children[2].innerText = `$${price.toFixed(2)}`;
            recipe.onclick = ()=>{
                controller.openStrand("recipeBook");
                controller.openSidebar("recipeDetails", transaction.recipes[i].recipe);
            }
            recipeList.appendChild(recipe);

            totalRecipes += transaction.recipes[i].quantity;
            totalPrice += price;
        }

        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let dateString = `${days[transaction.date.getDay()]}, ${months[transaction.date.getMonth()]} ${transaction.date.getDate()}, ${transaction.date.getFullYear()}`;

        document.getElementById("transactionDate").innerText = dateString;
        document.getElementById("totalRecipes").innerText = `${totalRecipes} recipes`;
        document.getElementById("totalPrice").innerText = `$${totalPrice.toFixed(2)}`;

        let button = document.getElementById("removeTransBtn");
        switch(merchant.pos){
            case "square":
                button.style.display = "none";
                break;
            case "none":
                button.style.display = "block";
                button.onclick = ()=>{controller.openModal("confirmDeleteTransaction", transaction)};
        }
    },

    remove: function(){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/transaction/${this.transaction.id}`, {
            method: "delete",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
        })
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    merchant.removeTransaction(this.transaction);
                    state.updateTransactions();

                    let from = new Date();
                    from.setDate(from.getDate() - 7);
                    from.setHours(0, 0, 0, 0);

                    controller.openStrand("transactions", merchant.getTransactions(from, new Date()));
                    controller.closeModal();
                    controller.createBanner("TRANSACTION REMOVED", "success");
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },
}

module.exports = transactionDetails;