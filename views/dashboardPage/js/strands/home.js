let home = {
    isPopulated: false,

    display: function(){
        if(!this.isPopulated){
            this.mostUsedRecipes();
            this.drawInventoryCheckCard();
            this.drawPopularCard();
            this.isPopulated = true;
        }
    },

    mostUsedRecipes: function(){
        let from = new Date();
        from.setDate(from.getDate() - 30);

        let recipes = merchant.getRecipesSold(from, new Date());
        recipes.sort((a, b) => (a.quantity > b.quantity) ? -1 : 1);
        let displayCount = (recipes.length < 10) ? recipes.length : 10;
        let container = document.getElementById("mostUsedRecipesList");

        while(container.children.length > 0){
            container.removeChild(container.firstChild);
        }

        for(let i = 0; i < displayCount; i++){
            let item = document.createElement("button");
            item.classList.add("choosable");
            item.onclick = ()=>{
                controller.openStrand("recipeBook");
                controller.openSidebar("recipeDetails", recipes[i].recipe);
            };
            container.appendChild(item);

            let leftText = document.createElement("p");
            leftText.innerText = recipes[i].recipe.name;
            item.appendChild(leftText);

            let rightText = document.createElement("p");
            rightText.innerText = recipes[i].quantity;
            item.appendChild(rightText);
        }
    },

    mostUsedIngredients: function(){
        let ingredients = [];
        let from = new Date();
        from.setDate(from.getDate() - 30);

        for(let i = 0; i < merchant.inventory.length; i++){
            let cost = merchant.inventory[i].getSoldQuantity(from, new Date()) * merchant.inventory[i].ingredient.getUnitCost();
            
            ingredients.push({
                inventoryItem: merchant.inventory[i],
                unitCost: cost
            });
        }

        ingredients.sort((a, b) => (a.unitCost > b.unitCost) ? -1 : 1);
        let container = document.getElementById("mostUsedList");

        while(container.children.length > 0){
            container.removeChild(container.firstChild);
        }

        let displayCount = (merchant.inventory.length < 10) ? merchant.inventory.length : 10;

        for(let i = 0; i < displayCount; i++){
            if(ingredients[i].unitCost === 0) break;
            let item = document.createElement("button");
            item.classList.add("choosable");
            item.onclick = ()=>{
                controller.openStrand("ingredients");
                controller.openSidebar("ingredientDetails", ingredients[i].inventoryItem);
            }
            container.appendChild(item);

            let leftText = document.createElement("p");
            leftText.innerText = ingredients[i].inventoryItem.ingredient.name;
            item.appendChild(leftText);

            let rightText = document.createElement("p");
            rightText.innerText = `$${ingredients[i].unitCost.toFixed(2)}`;
            item.appendChild(rightText);
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
        let template = document.getElementById("ingredientCheck").content.children[0];
        while(ul.children.length > 0){
            ul.removeChild(ul.firstChild);
        }
        for(let i = 0; i < rands.length; i++){
            let ingredientCheck = template.cloneNode(true);
            let input = ingredientCheck.children[1].children[1];
            const ingredient = merchant.inventory[rands[i]];

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
                        }

                        merchant.addIngredients(response);
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