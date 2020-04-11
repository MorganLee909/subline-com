window.homeStrandObj = {
    isPopulated: false,

    display: function(){
        if(!this.isPopulated){
            let today = new Date();
            let firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            let firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            let lastMonthtoDay = new Date(new Date().setMonth(today.getMonth() - 1));

            let revenueThisMonth = this.calculateRevenue(dateIndices(firstOfMonth));
            let revenueLastmonthToDay = this.calculateRevenue(dateIndices(firstOfLastMonth, lastMonthtoDay));

            document.querySelector("#revenue").innerText = `$${revenueThisMonth.toLocaleString("en")}`;

            let revenueChange = ((revenueThisMonth - revenueLastmonthToDay) / revenueLastmonthToDay) * 100;
            
            let img = "";
            if(revenueChange >= 0){
                img = "/shared/images/upArrow.png";
            }else{
                img = "/shared/images/downArrow.png";
            }
            document.querySelector("#revenueChange p").innerText = `${Math.abs(revenueChange).toFixed(2)}% vs last month`;
            document.querySelector("#revenueChange img").src = img;

            this.isPopulated = true;
        }
    },

    calculateRevenue: function(indices){
        let total = 0;

        for(let i = indices[0]; i <= indices[1]; i++){
            for(let recipe of transactions[i].recipes){
                for(let merchRecipe of merchant.recipes){
                    if(recipe.recipe === merchRecipe._id){
                        total += recipe.quantity * merchRecipe.price;
                    }
                }
            }
        }

        return total / 100;
    }
}