let home = {
    isPopulated: false,

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
        let lastMonthToDay = new Date(new Date().setMonth(today.getMonth() - 1));

        const revenueThisMonth = merchant.getRevenue(firstOfMonth);
        const revenueLastMonthToDay = merchant.getRevenue(firstOfLastMonth, lastMonthToDay);

        document.getElementById("revenue").innerText = `$${revenueThisMonth.toFixed(2)}`;

        let revenueChange = ((revenueThisMonth - revenueLastMonthToDay) / revenueLastMonthToDay) * 100;
        
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
        let monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        let revenue = [];
        let dates = [];
        let dayRevenue = 0;
        const transactions = merchant.getTransactions(monthAgo);
        let currentDate = (transactions.length > 0) ? transactions[0].date : undefined;
        for(let i = 0; i < transactions.length; i++){
            if(transactions[i].date.getDate() !== currentDate.getDate()){
                revenue.push(dayRevenue / 100);
                dayRevenue = 0;
                dates.push(currentDate);
                currentDate = transactions[i].date;
            }

            for(let j = 0; j < transactions[i].recipes.length; j++){
                const recipe = transactions[i].recipes[j];

                dayRevenue += recipe.recipe.price * recipe.quantity;
            }
        }

        console.log(dates);
        console.log(revenue);
        const trace = {
            x: dates,
            y: revenue,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107)"
            }
        }

        let layout = {
            title: "REVENUE",
            xaxis: {
                title: "DATE"
            },
            yaxis: {
                title: "$"
            },
            paper_bgcolor: "rgba(0, 0, 0, 0)"
        }

        if(screen.width < 1200){
            layout.margin = {
                l: 35,
                r: 0
            }
        }

        Plotly.newPlot("graphCard", [trace], layout);
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
        let template = document.getElementById("ingredientCheck").content.children[0];
        while(ul.children.length > 0){
            ul.removeChild(ul.firstChild);
        }
        for(let i = 0; i < rands.length; i++){
            let ingredientCheck = template.cloneNode(true);
            let input = ingredientCheck.children[1].children[1];
            const ingredient = merchant.ingredients[rands[i]];

            ingredientCheck.ingredient = ingredient;
            ingredientCheck.children[0].innerText = ingredient.ingredient.name;
            ingredientCheck.children[1].children[0].onclick = ()=>{
                input.value--;
                input.changed = true;
            };

            input.value = ingredient.quantity.toFixed(2);
            ingredientCheck.children[2].innerText = ingredient.ingredient.unit.toUpperCase();
            
            ingredientCheck.children[1].children[2].onclick = ()=>{
                input.value++;
                input.changed = true;
            }
            input.onchange = ()=>{input.changed = true};
            

            ul.appendChild(ingredientCheck);
        }

        document.getElementById("inventoryCheck").onclick = ()=>{this.submitInventoryCheck()};
    },

    drawPopularCard: function(){
        let thisMonth = new Date();
        thisMonth.setDate(1);

        const ingredientList = merchant.getIngredientsSold(thisMonth);
        if(ingredientList !== false){
            ingredientList.sort((a, b)=>{
                if(a.quantity < b.quantity){
                    return 1;
                }
                if(a.quantity > b.quantity){
                    return -1;
                }

                return 0;
            });

            let quantities = [];
            let labels = [];
            let colors = [];
            let count = (ingredientList.length < 5) ? ingredientList.length - 1 : 4;
            for(let i = count; i >= 0; i--){
                const ingredientName = ingredientList[i].ingredient.name;
                const ingredientQuantity = ingredientList[i].quantity;
                const unitName = ingredientList[i].ingredient.unit;

                quantities.push(ingredientList[i].quantity);
                labels.push(`${ingredientName}: ${ingredientQuantity.toFixed(2)} ${unitName.toUpperCase()}`);
                if(i === 0){
                    colors.push("rgb(255, 99, 107");
                }else{
                    colors.push("rgb(179, 191, 209");
                }
            }

            let trace = {
                x: quantities,
                type: "bar",
                orientation: "h",
                text: labels,
                textposition: "auto",
                hoverinfo: "none",
                marker: {
                    color: colors
                }
            }

            let layout = {
                title: {
                    text: "MOST POPULAR INGREDIENTS"
                },
                xaxis: {
                    zeroline: false,
                    title: "QUANTITY"
                },
                yaxis: {
                    showticklabels: false
                },
                paper_bgcolor: "rgba(0, 0, 0, 0)"
            }

            if(screen.width < 1200){
                layout.margin = {
                    l: 10,
                    r: 10,
                    t: 80,
                    b: 40
                };
            }

            
            Plotly.newPlot("popularIngredientsCard", [trace], layout);
        }else{
            document.getElementById("popularCanvas").style.display = "none";

            let notice = document.createElement("p");
            notice.innerText = "N/A";
            notice.classList = "notice";
            document.getElementById("popularIngredientsCard").appendChild(notice);
        }
    },

    //Need to change the updating of ingredients
    //should update the ingredient directly, then send that.  Maybe...
    submitInventoryCheck: function(){
        let lis = document.querySelectorAll("#inventoryCheckCard li");

        let data = [];

        for(let i = 0; i < lis.length; i++){
            if(lis[i].children[1].children[1].value >= 0){
                if(lis[i].children[1].children[1].changed === true){
                    let merchIngredient = lis[i].ingredient;
                    data.push({
                        id: merchIngredient.ingredient.id,
                        quantity: lis[i].children[1].children[1].value
                    });

                    lis[i].children[1].children[1].changed = false;
                }
            }else{
                controller.createBanner("CANNOT HAVE NEGATIVE INGREDIENTS", "error");
                return;
            }
        }
        
        if(data.length > 0){
            let loader = document.getElementById("loaderContainer");
            loader.style.display = "flex";

            fetch("/merchant/ingredients/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        controller.createBanner(response, "error");
                    }else{
                        for(let i = 0; i < response.length; i++){
                            merchant.removeIngredient(merchant.getIngredient(response[i].ingredient._id));
                            merchant.addIngredients(response);
                        }
                        state.updateIngredients();
                        controller.createBanner("INGREDIENTS UPDATED", "success");
                    }
                })
                .catch((err)=>{
                    controller.createBanner("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE", "error");
                })
                .finally(()=>{
                    loader.style.display = "none";
                });
        }
    }
}

module.exports = home;