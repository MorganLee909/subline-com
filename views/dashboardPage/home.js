window.homeStrandObj = {
    isPopulated: false,
    graph: {},

    display: function(){
        if(!this.isPopulated){
            this.drawRevenueCard();
            this.drawRevenueGraph();
            this.drawInventoryCheckCard();
            this.drawPopularCard();

            this.isPopulated = true;
        }
    },

    drawRevenueCard: function(){
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
    },

    drawRevenueGraph: function(){
        let graphCanvas = document.querySelector("#graphCanvas");
        let today = new Date();

        graphCanvas.height = graphCanvas.parentElement.clientHeight;
        graphCanvas.width = graphCanvas.parentElement.clientWidth;

        this.graph = new LineGraph(graphCanvas);
        this.graph.addTitle("Revenue");

        let thirtyAgo = new Date(today);
        thirtyAgo.setDate(today.getDate() - 29);

        let data = this.graphData(dateIndices(thirtyAgo));
        if(data){
            this.graph.addData(
                data,
                [thirtyAgo, new Date()],
                "Revenue"
            );
        }else{
            document.querySelector("#graphCanvas").style.display = "none";
            
            let notice = document.createElement("h1");
            notice.innerText = "NO DATA YET";
            notice.classList = "notice";
            document.querySelector("#graphCard").appendChild(notice);
        }
    },

    drawInventoryCheckCard: function(){
        let num;
        if(merchant.inventory.length < 5){
            num = merchant.inventory.length;
        }else{
            num = 5;
        }
        let rands = [];
            for(let i = 0; i < num; i++){
                let rand = Math.floor(Math.random() * merchant.inventory.length);

                if(rands.includes(rand)){
                    i--;
                }else{
                    rands[i] = rand;
                }
            }

            let ul = document.querySelector("#inventoryCheckCard ul");
            while(ul.children.length > 0){
                ul.removeChild(ul.firstChild);
            }
            for(let i = 0; i < rands.length; i++){
                let li = document.createElement("li");
                li.classList = "flexRow";
                li.ingredientIndex = rands[i];
                ul.appendChild(li);

                let name = document.createElement("p");
                name.innerText = merchant.inventory[rands[i]].ingredient.name;
                li.appendChild(name);

                let input = document.createElement("input");
                input.type = "number";
                input.value = merchant.inventory[rands[i]].quantity;
                li.appendChild(input);

                let label = document.createElement("p");
                label.innerText = merchant.inventory[rands[i]].ingredient.unit;
                li.appendChild(label);
            }
    },

    drawPopularCard: function(){
        let dataArray = [];
        let now = new Date();
        let thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let ingredientList = ingredientsSold(dateIndices(thisMonth));
        if(ingredientList){
            for(let i = 0; i < 5; i++){
                let max = ingredientList[0].quantity
                let index = 0;
                for(let j = 0; j < ingredientList.length; j++){
                    if(ingredientList[j].quantity > max){
                        max = ingredientList[j].quantity;
                        index = j;
                    }
                }

                dataArray.push({
                    num: max,
                    label: `${ingredientList[index].name}: ${ingredientList[index].quantity} ${ingredientList[index].unit}`
                });
                ingredientList.splice(index, 1);
            }

            let thisCanvas = document.querySelector("#popularCanvas");
            thisCanvas.width = thisCanvas.parentElement.clientWidth;
            thisCanvas.height = thisCanvas.parentElement.clientHeight * 0.75;

            let popularGraph = new HorizontalBarGraph(document.querySelector("#popularCanvas"));
            popularGraph.addData(dataArray);
        }else{
            document.querySelector("#popularCanvas").style.display = "none";

            let notice = document.createElement("p");
            notice.innerText = "N/A";
            notice.classList = "notice";
            document.querySelector("#popularIngredientsCard").appendChild(notice);
        }
    },

    calculateRevenue: function(indices){
        let total = 0;

        for(let i = indices[0]; i <= indices[1]; i++){
            for(let j = 0; j < transactions[i].recipes.length; j++){
                for(let k = 0; k < merchant.recipes.length; k++){
                    if(transactions[i].recipes[j].recipe === merchant.recipes[k]._id){
                        total += transactions[i].recipes[j].quantity * merchant.recipes[k].price;
                    }
                }
            }
        }

        return total / 100;
    },

    /*
    Create the data for the revenue graph
    Input: 
        dateRange: Array containing start and end indices for transactions
    Return: List of revenue by day between the dates specified
    */
    graphData: function(dateRange){
        if(!dateRange){
            return false;
        }

        let dataList = new Array(30).fill(0);
        let currentDate = transactions[dateRange[0]].date;
        let arrayIndex = 0;

        for(let i = dateRange[0]; i <= dateRange[1]; i++){
            if(transactions[i].date.getDate() !== currentDate.getDate()){
                currentDate = transactions[i].date;
                arrayIndex++;
            }
            for(let j = 0; j < transactions[i].recipes.length; j++){
                for(let merchRecipe of merchant.recipes){
                    if(transactions[i].recipes[j].recipe === merchRecipe._id){
                        dataList[arrayIndex] = parseFloat((dataList[arrayIndex] + (transactions[i].recipes[j].quantity * merchRecipe.price) / 100).toFixed(2));
                        break;
                    }
                }
            }
        }

        return dataList;
    },

    submitInventoryCheck: function(){
        let lis = document.querySelectorAll("#inventoryCheckCard ul li");

        let changes = [];

        for(let i = 0; i < lis.length; i++){
            if(lis[i].children[1].value >= 0){
                let merchIngredient = merchant.inventory[lis[i].ingredientIndex];

                let value = parseInt(lis[i].children[1].value);

                if(value !== merchIngredient.quantity){
                    changes.push({
                        id: merchIngredient.ingredient._id,
                        quantity: value - merchIngredient.quantity
                    });
                }
            }else{
                banner.createError("Cannot have negative ingredients");
                return;
            }
        }
        
        if(changes.length > 0){
            fetch("/merchant/ingredients/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(changes)
            })
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response.data) === "string"){
                        banner.createError(response.data);
                    }else{
                        banner.createNotification("Ingredients updated");
                        updateInventory(changes);
                    }
                })
                .catch((err)=>{});
        }
    }
}