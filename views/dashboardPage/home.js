window.homeStrandObj = {
    isPopulated: false,
    graph: {},

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

            this.graph = new LineGraph(
                document.querySelector("#graphCanvas"),
                "$",
                "Date"
            )

            let thirtyAgo = new Date(today);
            thirtyAgo.setDate(today.getDate() - 29);

            this.graph.addData(
                this.graphData(dateIndices(thirtyAgo)),
                [thirtyAgo, new Date()],
                "Revenue"
            );

            let ul = document.querySelector("#inventoryCheckCard ul");
            for(let i = 0; i < 5; i++){
                let li = document.createElement("li");
                li.innerText = merchant.inventory[i].ingredient.name;
                ul.appendChild(li);
            }

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
    },

    graphData: function(indices){
        let dataList = new Array(30).fill(0);
        let currentDate = transactions[indices[0]].date;
        let arrayIndex = 0;

        for(let i = indices[0]; i <= indices[1]; i++){
            if(transactions[i].date.getDate() !== currentDate.getDate()){
                currentDate = transactions[i].date;
                arrayIndex++;
            }
            for(let recipe of transactions[i].recipes){
                for(let merchRecipe of merchant.recipes){
                    if(recipe.recipe === merchRecipe._id){
                        dataList[arrayIndex] = parseFloat((dataList[arrayIndex] + (recipe.quantity * merchRecipe.price) / 100).toFixed(2));
                        break;
                    }
                }
            }
        }

        return dataList;
    }
}