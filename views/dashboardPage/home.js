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

        let revenueThisMonth = merchant.revenue(merchant.transactionIndices(firstOfMonth));
        let revenueLastmonthToDay = merchant.revenue(merchant.transactionIndices(firstOfLastMonth, lastMonthtoDay));

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

        let data = merchant.graphDailyRevenue(merchant.transactionIndices(thirtyAgo));
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
        if(merchant.ingredients.length < 5){
            num = merchant.ingredients.length;
        }else{
            num = 5;
        }
        let rands = [];
        for(let i = 0; i < num; i++){
            let rand = Math.floor(Math.random() * merchant.ingredients.length);

            if(rands.includes(rand)){
                i--;
            }else{
                rands[i] = rand;
            }
        }

        let ul = document.querySelector("#inventoryCheckCard ul");
        let template = document.querySelector("#ingredientCheck").content.children[0];
        while(ul.children.length > 0){
            ul.removeChild(ul.firstChild);
        }
        for(let i = 0; i < rands.length; i++){
            let ingredientCheck = template.cloneNode(true);
            let input = ingredientCheck.children[1].children[1];

            ingredientCheck.ingredientIndex = rands[i];
            ingredientCheck.children[0].innerText = merchant.ingredients[rands[i]].ingredient.name;
            ingredientCheck.children[1].children[0].onclick = ()=>{input.value--};
            input.value = merchant.ingredients[rands[i]].quantity;
            ingredientCheck.children[1].children[2].onclick = ()=>{input.value++}
            ingredientCheck.children[2].innerText = merchant.ingredients[rands[i]].ingredient.unit.toUpperCase();

            ul.appendChild(ingredientCheck);
        }
    },

    drawPopularCard: function(){
        let dataArray = [];
        let now = new Date();
        let thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        console.time("Ingredients Sold");
        let ingredientList = merchant.ingredientsSold(merchant.transactionIndices(thisMonth));
        console.timeEnd("Ingredients Sold");
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
                    label: `${ingredientList[index].ingredient.name}: ${+ingredientList[index].quantity.toFixed(2)} ${ingredientList[index].ingredient.unit}`
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

    submitInventoryCheck: function(){
        let lis = document.querySelectorAll("#inventoryCheckCard li");

        let changes = [];

        for(let i = 0; i < lis.length; i++){
            if(lis[i].children[1].children[1].value >= 0){
                let merchIngredient = merchant.inventory[lis[i].ingredientIndex];

                let value = parseFloat(lis[i].children[1].children[1].value);

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