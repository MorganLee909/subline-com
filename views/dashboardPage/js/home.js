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

        let revenueThisMonth = merchant.revenue(controller.transactionIndices(merchant.transactions, firstOfMonth));
        let revenueLastmonthToDay = merchant.revenue(controller.transactionIndices(merchant.transactions, firstOfLastMonth, lastMonthToDay));

        document.getElementById("revenue").innerText = `$${revenueThisMonth.toLocaleString("en")}`;

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
        let monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        let dateIndices = controller.transactionIndices(merchant.transactions, monthAgo);

        let revenue = [];
        let dates = [];
        let dayRevenue = 0;
        let currentDate = merchant.transactions[dateIndices[0]].date;
        for(let i = dateIndices[0]; i < dateIndices[1]; i++){
            if(merchant.transactions[i].date.getDate() !== currentDate.getDate()){
                revenue.push(dayRevenue / 100);
                dayRevenue = 0;
                dates.push(currentDate);
                currentDate = merchant.transactions[i].date;
            }

            for(let j = 0; j < merchant.transactions[i].recipes.length; j++){
                const recipe = merchant.transactions[i].recipes[j];

                dayRevenue += recipe.recipe.price * recipe.quantity;
            }
        }

        const trace = {
            x: dates,
            y: revenue,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107)"
            }
        }

        const layout = {
            title: "REVENUE",
            xaxis: {
                title: "DATE"
            },
            yaxis: {
                title: "$"
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
            ingredientCheck.children[1].children[0].onclick = ()=>{input.value--};
            input.value = ingredient.ingredient.convert(ingredient.quantity).toFixed(2);
            ingredientCheck.children[1].children[2].onclick = ()=>{input.value++}
            ingredientCheck.children[2].innerText = ingredient.ingredient.unit.toUpperCase();

            ul.appendChild(ingredientCheck);
        }

        document.getElementById("inventoryCheck").onclick = ()=>{this.submitInventoryCheck()};
    },

    drawPopularCard: function(){
        let thisMonth = new Date();
        thisMonth.setDate(1);

        let ingredientList = merchant.ingredientsSold(controller.transactionIndices(merchant.transactions, thisMonth));
        if(ingredientList !== false){
            ingredientList.sort((a, b) => a.quantity < b.quantity);

            let quantities = [];
            let names = [];
            let labels = [];
            let colors = [];
            for(let i = 4; i >= 0; i--){
                quantities.push(ingredientList[i].quantity);
                names.push(ingredientList[i].ingredient.name.toUpperCase());
                labels.push(`${ingredientList[i].ingredient.convert(ingredientList[i].quantity).toFixed(2)} ${ingredientList[i].ingredient.unit.toUpperCase()}`);
                if(i === 0){
                    colors.push("rgb(255, 99, 107");
                }else{
                    colors.push("rgb(179, 191, 209");
                }
            }

            let trace = {
                x: quantities,
                y: names,
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
                title: "MOST POPULAR INGREDIENTS",
                xaxis: {
                    zeroline: false,
                    title: "QUANTITY IN GRAMS"
                }
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

    submitInventoryCheck: function(){
        let lis = document.querySelectorAll("#inventoryCheckCard li");

        let changes = [];
        let fetchData = [];

        for(let i = 0; i < lis.length; i++){
            if(lis[i].children[1].children[1].value >= 0){
                let merchIngredient = lis[i].ingredient;

                let value = parseFloat(lis[i].children[1].children[1].value);

                if(value !== merchIngredient.quantity){
                    changes.push({
                        id: merchIngredient.ingredient.id,
                        ingredient: merchIngredient.ingredient,
                        quantity: value
                    });

                    fetchData.push({
                        id: merchIngredient.ingredient.id,
                        quantity: value
                    });
                }
            }else{
                banner.createError("CANNOT HAVE NEGATIVE INGREDIENTS");
                return;
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";
        
        if(fetchData.length > 0){
            fetch("/merchant/ingredients/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(fetchData)
            })
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        

                        merchant.editIngredients(changes);
                        banner.createNotification("INGREDIENTS UPDATED");
                    }
                })
                .catch((err)=>{})
                .finally(()=>{
                    loader.style.display = "none";
                });
        }
    }
}

module.exports = home;