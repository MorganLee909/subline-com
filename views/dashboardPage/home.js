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

            let graphCanvas = document.querySelector("#graphCanvas");
            graphCanvas.height = graphCanvas.parentElement.clientHeight;
            graphCanvas.width = graphCanvas.parentElement.clientWidth;

            this.graph = new LineGraph(graphCanvas);
            this.graph.addTitle("Revenue");

            let thirtyAgo = new Date(today);
            thirtyAgo.setDate(today.getDate() - 29);

            this.graph.addData(
                this.graphData(dateIndices(thirtyAgo)),
                [thirtyAgo, new Date()],
                "Revenue"
            );

            //Inventory Check
            let rands = [];
            for(let i = 0; i < 5; i++){
                let rand = Math.floor(Math.random() * merchant.inventory.length);

                if(rands.includes(rand)){
                    i--;
                }else{
                    rands[i] = rand;
                }
            }

            let ul = document.querySelector("#inventoryCheckCard ul");
            for(let rand of rands){
                let li = document.createElement("li");
                li.classList = "flexRow";
                li.ingredientIndex = rand;
                ul.appendChild(li);

                let name = document.createElement("p");
                name.innerText = merchant.inventory[rand].ingredient.name;
                li.appendChild(name);

                let input = document.createElement("input");
                input.type = "number";
                input.value = merchant.inventory[rand].quantity;
                li.appendChild(input);

                let label = document.createElement("p");
                label.innerText = merchant.inventory[rand].ingredient.unit;
                li.appendChild(label);
            }

            //Most Popular ingredients
            let dataArray = [];
            let now = new Date();
            let thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            let ingredientList = this.ingredientsSold(this.getDateIndex(thisMonth));
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
            thisCanvas.height = thisCanvas.parentElement.clientHeight;

            let popularGraph = new HorizontalBarGraph(document.querySelector("#popularCanvas"));
            popularGraph.addData(dataArray);

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
    },

    updateInventory: function(){
        let lis = document.querySelectorAll("#inventoryCheckCard ul li");

        let changes = [];

        for(let li of lis){
            if(li.children[1].value >= 0){
                let merchIngredient = merchant.inventory[li.ingredientIndex];

                let change = li.children[1].value - merchIngredient.quantity;

                if(change !== 0){
                    changes.push({
                        id: merchIngredient.ingredient._id,
                        quantityChange: change
                    });
                }
            }else{
                banner.createError("Cannot have negative ingredients");
                return;
            }
        }
        
        if(changes.length > 0){
            fetch("/merchant/ingredients/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(changes)
            })
                .then((response)=>{
                    banner.createError("Ingredients updated");
                    1
                    if(typeof(response.data) === "string"){
                        console.log(err);
                    }else{
                        for(let change of changes){
                            merchant.inventory.find((item)=> item.ingredient._id === change.id).quantity += change.quantityChange;
                        }
                    }
                })
                .catch((err)=>{
                    console.log(err);
                });
        }
    },

    ingredientsSold: function(dateRange){
        let recipes = this.recipesSold(dateRange);
        let ingredientList = [];

        for(let recipe of recipes){
            for(let merchRecipe of merchant.recipes){
                for(let ingredient of merchRecipe.ingredients){
                    let exists = false;
                    for(let item of ingredientList){
                        if(item.id === ingredient.ingredient._id){
                            exists = true;
                            item.quantity += ingredient.quantity * recipe.quantity;
                            break;
                        }
                    }

                    if(!exists){
                        ingredientList.push({
                            id: ingredient.ingredient._id,
                            quantity: ingredient.quantity * recipe.quantity,
                            name: ingredient.ingredient.name,
                            unit: ingredient.ingredient.unit
                        })
                    }
                }
            }
        }

        console.log(ingredientList);

        return ingredientList;
    },

    //Gets the number of recipes sold between two dates (dateRange)
    //Inputs
    //  dateRange: array containing a start date and an endDate
    //Output
    //  List of objects
    //      id: id of specific recipe
    //      quantity: quantity sold of that recipe
    recipesSold: function(dateRange){
        let recipeList = [];

        for(let i = dateRange[0]; i <= dateRange[1]; i++){
            for(let recipe of transactions[i].recipes){
                let exists = false;
                for(let item of recipeList){
                    if(item.id === recipe.recipe){
                        exists = true;
                        item.quantity += recipe.quantity;
                        break;
                    }
                }

                if(!exists){
                    recipeList.push({
                        id: recipe.recipe,
                        quantity: recipe.quantity
                    })
                }
            }
        }

        return recipeList;
    },

    //Gives start and stop indices from transactions for a date range
    //Inputs
    //  from: datetime to start at
    //  to: datetimie to end at
    //Output
    //  Array containing 2 elements, start index and stop index
    getDateIndex: function(from, to = new Date()){
        let indexRange = [0, transactions.length - 1];
        for(let i = 0; i < transactions.length; i++){
            if(from <= transactions[i].date && indexRange[0] === 0){
                indexRange[0] = i;
            }

            if(to < transactions[i].date){
                indexRange[1] = i - 1;
                break;
            }
        }

        return indexRange;
    }
}